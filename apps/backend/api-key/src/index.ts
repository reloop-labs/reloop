import { log, parseError } from "evlog";
import "dotenv/config";
import { opentelemetry } from "@elysia/opentelemetry";
import { openapi } from "@elysiajs/openapi";
import { serverTiming } from "@elysiajs/server-timing";
import { apiKeyConfig } from "@reloop/api-key/api-key.config";
import { apiKeyRoutes } from "@reloop/api-key/routes/api-key/api-key.routes";
import { agentCardRoute } from "@reloop/api-key/routes/landing/agent-card.route";
import { healthRoute } from "@reloop/api-key/routes/landing/health.route";
import { landingRoute } from "@reloop/api-key/routes/landing/landing.route";
import { loader } from "@reloop/api-key/utils/loader";
import { Elysia } from "elysia";
import { initLogger } from "evlog";
import { createOTLPDrain } from "evlog/otlp";
import { evlog } from "evlog/elysia";

const parseOtlpHeaders = (headersStr?: string): Record<string, string> | undefined => {
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
	env: { service: "api-key" },
	drain: apiKeyConfig.OTEL_EXPORTER_OTLP_ENDPOINT
		? createOTLPDrain({
				endpoint: apiKeyConfig.OTEL_EXPORTER_OTLP_ENDPOINT,
				headers: parseOtlpHeaders(apiKeyConfig.OTEL_EXPORTER_OTLP_HEADERS),
			})
		: undefined,
});

const port = apiKeyConfig.port;
const apiKeyService = new Elysia({
	prefix: "/api/api-key",
	name: "API Key Service",
})
	.use(opentelemetry())
	.use(
		openapi({
			documentation: {
				info: { title: "API KEY Service", version: "1.2.0" },
				components: {
					securitySchemes: {
						apiKey: { type: "apiKey", name: "x-api-key", in: "header" },
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
	.use(agentCardRoute)
	.use(healthRoute)
	.use(apiKeyRoutes)
	.onStart(async () => {
		await loader();
	})
	.listen(port, () => {
		log.info(
			"API Key Service",
			`Running on:\n  - Local: http://localhost:${port}/api/api-key\n  - Base:  ${apiKeyConfig.BASE_URL}/api/api-key`,
		);
	});

export type ApiKeyService = typeof apiKeyService;
