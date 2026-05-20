import "dotenv/config";
import { agentCardRoute } from "@be/upload/routes/landing/agent-card.route";
import { healthRoute } from "@be/upload/routes/landing/health.route";
import { landingRoute } from "@be/upload/routes/landing/landing.route";
import { uploadRoutes } from "@be/upload/routes/upload/upload.routes";
import { uploadConfig } from "@be/upload/upload.config";
import { loader } from "@be/upload/utils/loader";
import { openapi } from "@elysiajs/openapi";
import { serverTiming } from "@elysiajs/server-timing";
import { Elysia } from "elysia";
import { initLogger, log, parseError } from "evlog";
import { evlog } from "evlog/elysia";

initLogger({ env: { service: "upload" } });

const port = uploadConfig.port;
const uploadService = new Elysia({
	prefix: "/api/upload",
	name: "Upload Service",
})
	.use(evlog())
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
