import "dotenv/config";
import { agentCardRoute } from "@be/tool/routes/landing/agent-card.route";
import { healthRoute } from "@be/tool/routes/landing/health.route";
import { landingRoute } from "@be/tool/routes/landing/landing.route";
import { toolRoutes } from "@be/tool/routes/tool/tool.routes";
import { toolConfig } from "@be/tool/tool.config";
import { loader } from "@be/tool/utils/loader";
import { opentelemetry } from "@elysia/opentelemetry";
import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { serverTiming } from "@elysiajs/server-timing";
import {
	requireUserAgentPlugin,
	secureHeadersPlugin,
} from "@reloop/auth/middleware";
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
	env: { service: "tool" },
	drain: toolConfig.OTEL_EXPORTER_OTLP_ENDPOINT
		? createOTLPDrain({
				endpoint: toolConfig.OTEL_EXPORTER_OTLP_ENDPOINT,
				headers: parseOtlpHeaders(toolConfig.OTEL_EXPORTER_OTLP_HEADERS),
			})
		: undefined,
});

const port = toolConfig.port;

const toolService = new Elysia({
	prefix: "/api/tool",
	name: "Tool Service",
})
	.use(secureHeadersPlugin({ profile: "api" }))
	.use(
		requireUserAgentPlugin({
			excludePathSuffixes: [
				"/health",
				"/openapi",
				"/openapi/json",
				"/swagger",
				"/agent-card.json",
				// undici and Bun send no User-Agent by default, and this endpoint is
				// built to be called from other people's applications.
				"/v1/check",
			],
		}),
	)
	// Open origin is safe here and nowhere else in the platform: this endpoint
	// takes no credentials and returns nothing user-specific.
	.use(
		cors({
			origin: true,
			credentials: false,
			methods: ["GET", "POST", "OPTIONS"],
		}),
	)
	.use(opentelemetry())
	.use(
		openapi({
			documentation: {
				info: {
					title: "Tool Service",
					version: "1.0.0",
					description:
						"Disposable, role and free-provider checks for email addresses. Public and unauthenticated — no API key required, rate limited per IP.",
				},
			},
		}),
	)
	.use(evlog({ exclude: ["/", "/api", "**/health"] }))
	.use(serverTiming())
	.onError(({ code, error, set }) => {
		// Without this, a schema rejection returns a raw TypeBox dump — and this
		// endpoint is public, so that dump lands in front of a visitor.
		if (code === "VALIDATION") {
			set.status = 400;
			return {
				message: "Invalid request",
				why: `Expected an "email" field holding an address or domain of 1–${toolConfig.constants.maxInputLength} characters.`,
				fix: 'Send {"email": "you@example.com"} as JSON, or use GET /v1/check?email=you@example.com',
			};
		}

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
	.use(toolRoutes)
	.onStart(async () => {
		await loader();
	})
	.listen(port, () => {
		log.info(
			"Tool Service",
			`Running on:\n  - Local: http://localhost:${port}/api/tool\n  - Base:  ${toolConfig.BASE_URL}/api/tool`,
		);
	});

export type ToolService = typeof toolService;
