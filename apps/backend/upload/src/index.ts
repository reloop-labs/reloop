import { log } from "evlog";
import "dotenv/config";
import { landing } from "@be/upload/routes/landing/landing.index";
import { uploadRoutes } from "@be/upload/routes/upload/upload.routes";
import { uploadConfig } from "@be/upload/upload.config";
import { loader } from "@be/upload/utils/loader";
import { openapi } from "@elysiajs/openapi";
import { serverTiming } from "@elysiajs/server-timing";

import { Elysia } from "elysia";

const port = uploadConfig.port;
const uploadService = new Elysia({
	prefix: "/api/upload",
	name: "Upload Service",
})
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
	.use(landing)
	.use(uploadRoutes)
	.onStart(async () => {
		await loader();
	})
	.listen(port, () => {
		log.info("server", `Upload Server is running on http://localhost:${port}/api/upload`);
	});

export type UploadService = typeof uploadService;
