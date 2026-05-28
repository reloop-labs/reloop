import { initLogger, log } from "evlog";
import { createOTLPDrain } from "evlog/otlp";
import "dotenv/config";
import cors from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { emailConfig } from "@reloop/email/email.config";

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
	env: { service: "email" },
	drain: emailConfig.OTEL_EXPORTER_OTLP_ENDPOINT
		? createOTLPDrain({
				endpoint: emailConfig.OTEL_EXPORTER_OTLP_ENDPOINT,
				headers: parseOtlpHeaders(emailConfig.OTEL_EXPORTER_OTLP_HEADERS),
			})
		: undefined,
});
import { agentCardRoute } from "@reloop/email/routes/landing/agent-card.route";
import { healthRoute } from "@reloop/email/routes/landing/health.route";
import { landingRoute } from "@reloop/email/routes/landing/landing.route";
import { loader } from "@reloop/email/utils/loader";
import { Elysia } from "elysia";

const port = emailConfig.PORT;

const app = new Elysia({ prefix: "/api/email", name: "Email Service" })
	.use(cors({ origin: "*" }))
	.use(
		openapi({
			documentation: {
				info: {
					title: "Email Service",
					version: "1.0.0",
				},
			},
		}),
	)
	.use(landingRoute)
	.use(healthRoute)
	.use(agentCardRoute)
	.onStart(async () => {
		await loader();
	})
	.listen(port, () => {
		log.info(
			"Email Service",
			`Running on:\n  - Local: http://localhost:${port}/api/email\n  - Base:  ${emailConfig.BASE_URL}/api/email`,
		);
	});

export type App = typeof app;
