import "dotenv/config";
import { opentelemetry } from "@elysia/opentelemetry";
import { openapi } from "@elysiajs/openapi";
import { serverTiming } from "@elysiajs/server-timing";
import {
	requireUserAgentPlugin,
	secureHeadersPlugin,
} from "@reloop/auth/middleware";
import { domainConfig } from "@reloop/domain/domain.config";
import { domainRoutes } from "@reloop/domain/routes/domain/domain.routes";
import { agentCardRoute } from "@reloop/domain/routes/landing/agent-card.route";
import { healthRoute } from "@reloop/domain/routes/landing/health.route";
import { landingRoute } from "@reloop/domain/routes/landing/landing.route";
import { loader } from "@reloop/domain/utils/loader";
import { Elysia } from "elysia";
import { initLogger, log, parseError } from "evlog";
import { evlog } from "evlog/elysia";
import { createOTLPDrain } from "evlog/otlp";

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
	env: { service: "domain" },
	drain: domainConfig.OTEL_EXPORTER_OTLP_ENDPOINT
		? createOTLPDrain({
				endpoint: domainConfig.OTEL_EXPORTER_OTLP_ENDPOINT,
				headers: parseOtlpHeaders(domainConfig.OTEL_EXPORTER_OTLP_HEADERS),
			})
		: undefined,
});

const port = domainConfig.port;

const domainService = new Elysia({
	prefix: "/api/domain",
	name: "Domain Service",
})
	.use(secureHeadersPlugin({ profile: "api" }))
	.use(
		requireUserAgentPlugin({
			// Caddy on-demand TLS ask must work even if the client omits UA.
			excludePathSuffixes: [
				"/health",
				"/openapi",
				"/openapi/json",
				"/swagger",
				"/agent-card.json",
				"/caddy/ask",
			],
		}),
	)
	.use(opentelemetry())
	.use(
		openapi({
			documentation: {
				info: {
					title: "Domain Service",
					version: "1.2.0",
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
	.use(evlog({ exclude: ["/", "/api/*", "/api/*/", "**/health"] }))
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
	.use(domainRoutes)
	.onStart(async () => {
		await loader();
	})
	.listen(port, () => {
		log.info(
			"Domain Service",
			`Running on:\n  - Local: http://localhost:${port}/api/domain\n  - Base:  ${domainConfig.BASE_URL}/api/domain`,
		);
	});

export type DomainService = typeof domainService;
