import "dotenv/config";
import { landing } from "@be/template/routes/landing/landing.index";
import { roomsPlugin } from "@be/template/routes/template/room/room";
import { templateRoutes } from "@be/template/routes/template/template.routes";
import { templateConfig } from "@be/template/template.config";
import { loader } from "@be/template/utils/loader";
import { openapi } from "@elysiajs/openapi";
import { serverTiming } from "@elysiajs/server-timing";
import { logger } from "@reloop/logger";
import { Elysia } from "elysia";
import { collaborationPlugin } from "./plugins/collaboration";
import { persistencePlugin } from "./plugins/persistence";

const port = templateConfig.port;
const templateService = new Elysia({
	prefix: "/api/template",
	name: "Template Service",
})
	.use(
		openapi({
			documentation: {
				info: {
					title: "Template Service",
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
	.use(templateRoutes)
	.use(roomsPlugin)
	.use(persistencePlugin)
	.use(collaborationPlugin)
	.onStart(async () => {
		await loader();
	})
	.listen(port, () => {
		logger.info(
			`Template Server is running on ${templateConfig.BASE_URL}/api/template`,
		);
	});

export type TemplateService = typeof templateService;
