import { log } from "evlog";
import "dotenv/config";
import { openapi } from "@elysiajs/openapi";
import { serverTiming } from "@elysiajs/server-timing";
import { apiKeyRoutes } from "@reloop/api-key/routes/api-key/api-key.routes";
import { landing } from "@reloop/api-key/routes/landing/landing.index";
import { loader } from "@reloop/api-key/utils/loader";

import { Elysia } from "elysia";
import { initLogger } from "evlog";
import { evlog } from "evlog/elysia";
import { apiKeyConfig } from "./api-key.config";

initLogger({ env: { service: "api-key" } });

const port = apiKeyConfig.port;
const apiKeyService = new Elysia({
	prefix: "/api/api-key",
	name: "API Key Service",
})
	.use(evlog())
	.use(
		openapi({
			documentation: {
				info: {
					title: "API KEY Service",
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
	.use(apiKeyRoutes)
	.onStart(async () => {
		await loader();
	})
	.listen(port, () => {
		log.info("server", `API Key Server is running on http://localhost:${port}/api/api-key`);
	});

export type ApiKeyService = typeof apiKeyService;
