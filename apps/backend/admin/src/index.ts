import "dotenv/config";
import cors from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { initLogger, log, parseError } from "evlog";
import { evlog } from "evlog/elysia";
import { createOTLPDrain } from "evlog/otlp";
import { adminConfig } from "./admin.config";
import { adminRoutes } from "./routes/admin/admin.routes";
import { healthRoute } from "./routes/landing/health.route";
import { landingRoute } from "./routes/landing/landing.route";

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
	env: { service: "admin" },
	drain: adminConfig.OTEL_EXPORTER_OTLP_ENDPOINT
		? createOTLPDrain({
				endpoint: adminConfig.OTEL_EXPORTER_OTLP_ENDPOINT,
				headers: parseOtlpHeaders(adminConfig.OTEL_EXPORTER_OTLP_HEADERS),
			})
		: undefined,
});

const port = adminConfig.PORT;

const app = new Elysia({ prefix: "/api/admin", name: "Admin Service" })
	.use(cors({ origin: "*", credentials: true }))
	.use(
		openapi({
			documentation: {
				info: {
					title: "Admin Service",
					version: "1.0.0",
				},
				components: {
					securitySchemes: {
						cookieAuth: {
							type: "apiKey",
							in: "cookie",
							name: "better-auth.session_token",
						},
					},
				},
			},
		}),
	)
	.use(evlog({ exclude: ["**/health"] }))
	.use(landingRoute)
	.use(healthRoute)
	.use(adminRoutes)
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
	.listen(port, () => {
		log.info(
			"Admin Service",
			`Running on:\n  - Local: http://localhost:${port}/api/admin\n  - Base:  ${adminConfig.BASE_URL}/api/admin`,
		);
	});

export type App = typeof app;
