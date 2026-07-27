import "dotenv/config";
import { agentCardRoute } from "@be/upload/routes/landing/agent-card.route";
import { healthRoute } from "@be/upload/routes/landing/health.route";
import { landingRoute } from "@be/upload/routes/landing/landing.route";
import { uploadRoutes } from "@be/upload/routes/upload/upload.routes";
import { uploadConfig } from "@be/upload/upload.config";
import { loader } from "@be/upload/utils/loader";
import { openapi } from "@elysiajs/openapi";
import { serverTiming } from "@elysiajs/server-timing";
import { secureHeadersPlugin } from "@reloop/auth/middleware";
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
	env: { service: "upload" },
	drain: uploadConfig.OTEL_EXPORTER_OTLP_ENDPOINT
		? createOTLPDrain({
				endpoint: uploadConfig.OTEL_EXPORTER_OTLP_ENDPOINT,
				headers: parseOtlpHeaders(uploadConfig.OTEL_EXPORTER_OTLP_HEADERS),
			})
		: undefined,
});

const port = uploadConfig.port;
const uploadService = new Elysia({
	prefix: "/api/upload",
	name: "Upload Service",
})
	.use(secureHeadersPlugin({ profile: "api" }))
	.use(evlog({ exclude: ["/", "/api/*", "/api/*/", "**/health"] }))
	.use(
		openapi({
			documentation: {
				info: {
					title: "Upload Service",
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
	.use(uploadRoutes)
	.onStart(async () => {
		await loader();
	})
	.listen(port, () => {
		log.info(
			"Upload Service",
			`Upload Server is running on http://localhost:${port}/api/upload`,
		);
	});

export type UploadService = typeof uploadService;
