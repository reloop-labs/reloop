import { log, parseError } from "evlog";
import "dotenv/config";
import { openapi } from "@elysiajs/openapi";
import { serverTiming } from "@elysiajs/server-timing";
import { apiKeyConfig } from "@reloop/api-key/api-key.config";
import { apiKeyRoutes } from "@reloop/api-key/routes/api-key/api-key.routes";
import { landing } from "@reloop/api-key/routes/landing/landing.index";
import { loader } from "@reloop/api-key/utils/loader";
import { Elysia } from "elysia";
import { initLogger } from "evlog";
import { evlog } from "evlog/elysia";

initLogger({ env: { service: "api-key" } });

const port = apiKeyConfig.port;
const apiKeyService = new Elysia({
	prefix: "/api/api-key",
	name: "API Key Service",
})
	.use(evlog())
	.use(serverTiming())
	.use(
		openapi({
			documentation: {
				info: {
					title: "API KEY Service",
					version: "1.0.1",
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
	.use(landing)
	.use(apiKeyRoutes)
	.onStart(async () => {
		await loader();
	})
	.listen(port, () => {
		log.info(
			"server",
			`API Key Server is running on:\n  - Local: http://localhost:${port}/api/api-key\n  - Base:  ${apiKeyConfig.BASE_URL}/api/api-key`,
		);
	});

export type ApiKeyService = typeof apiKeyService;
