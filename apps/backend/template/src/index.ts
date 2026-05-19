import { log } from "evlog";
import "dotenv/config";
import { landing } from "@be/template/routes/landing/landing.index";
import { collaborationRoute } from "@be/template/routes/template/collaboration/collaboration.route";
import { roomRoutes } from "@be/template/routes/template/room/room.routes";
import { templateRoutes } from "@be/template/routes/template/template.routes";
import { templateConfig } from "@be/template/template.config";
import { loader } from "@be/template/utils/loader";
import { persistencePlugin } from "@be/template/utils/persistence";
import { openapi } from "@elysiajs/openapi";
import { serverTiming } from "@elysiajs/server-timing";

import { Elysia } from "elysia";

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
	.use(roomRoutes)
	.use(persistencePlugin)
	.use(collaborationRoute)
	.onStart(async () => {
		await loader();
	})
	.listen(port, () => {
		console.log(
			`Template Server is running on ${templateConfig.BASE_URL}/api/template`,
		);
	});

export type TemplateService = typeof templateService;
