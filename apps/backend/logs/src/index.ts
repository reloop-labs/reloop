import { initLogger, log, parseError } from "evlog";
import { createOTLPDrain } from "evlog/otlp";
import "dotenv/config";
import { opentelemetry } from "@elysia/opentelemetry";
import { openapi } from "@elysiajs/openapi";
import { serverTiming } from "@elysiajs/server-timing";
import { logsConfig } from "@reloop/logs/logs.config";
import { loader } from "@reloop/logs/utils/loader";
import { Elysia } from "elysia";
import { evlog } from "evlog/elysia";
import { logCleanupCron } from "./cron/cleanup-logs.cron";
import { agentCardRoute } from "./routes/landing/agent-card.route";
import { healthRoute } from "./routes/landing/health.route";
import { landingRoute } from "./routes/landing/landing.route";
import { logsRoutes } from "./routes/logs/logs.routes";

const parseOtlpHeaders = (
	headersStr?: string,
): Record<string, string> | undefined => {
	if (!headersStr) return undefined;
	const headers: Record<string, string> = {};
	const decoded = decodeURIComponent(headersStr);
	for (const pair of decoded.split(",")) {
		const eqIndex = pair.indexOf("=");
		if (eqIndex > 0) {
			const key = pair.slice(0, eqIndex).trim();
			const value = pair.slice(eqIndex + 1).trim();
			if (key && value) headers[key] = value;
		}
	}
	return Object.keys(headers).length > 0 ? headers : undefined;
};

initLogger({
	env: { service: "logs" },
	drain: logsConfig.OTEL_EXPORTER_OTLP_ENDPOINT
		? createOTLPDrain({
				endpoint: logsConfig.OTEL_EXPORTER_OTLP_ENDPOINT,
				headers: parseOtlpHeaders(logsConfig.OTEL_EXPORTER_OTLP_HEADERS),
			})
		: undefined,
});

const port = logsConfig.port;
const logsService = new Elysia({
	prefix: "/api/logs",
	name: "Logs Service",
})
	.use(opentelemetry())
	.use(
		openapi({
			documentation: {
				info: {
					title: "Logs Service",
					version: "1.0.0",
				},
				components: {
					securitySchemes: {
						apiKey: {
							type: "apiKey",
							name: "x-api-key",
							in: "header",
						},
					},
				},
			},
		}),
	)
	.use(evlog())
	.use(serverTiming())
	.onError(({ error, set }) => {
		const parsed = parseError(error);
		set.status = parsed.status;
		return {
			message: parsed.message,
			why: parsed.why,
			fix: parsed.fix,
			link: parsed.link,
		};
	})
	.use(landingRoute)
	.use(healthRoute)
	.use(agentCardRoute)
	.use(logsRoutes)
	.use(logCleanupCron)
	.onStart(async () => {
		await loader();
	})
	.listen(port, () => {
		log.info(
			"Logs Service",
			`Running on:\n  - Local: http://localhost:${port}/api/logs\n  - Base:  ${logsConfig.BASE_URL}/api/logs`,
		);
	});

export type LogsService = typeof logsService;
