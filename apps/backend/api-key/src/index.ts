import { log, parseError } from "evlog";
import "dotenv/config";
import { openapi } from "@elysiajs/openapi";
import { serverTiming } from "@elysiajs/server-timing";
import { apiKeyConfig } from "@reloop/api-key/api-key.config";
import { apiKeyRoutes } from "@reloop/api-key/routes/api-key/api-key.routes";
import { agentCardRoute } from "@reloop/api-key/routes/landing/agent-card.route";
import { healthRoute } from "@reloop/api-key/routes/landing/health.route";
import { landingRoute } from "@reloop/api-key/routes/landing/landing.route";
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
	.use(
		openapi({
			documentation: {
				info: { title: "API KEY Service", version: "1.0.1", },
				components: {
					securitySchemes: {
						apiKey: { type: "apiKey", name: "x-api-key", in: "header", },
					},
				},
			},
		}),
	)
	.use(evlog())
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
	.use(apiKeyRoutes)
	.onStart(async () => {
		await loader();
	})
	.listen(port, () => {
		log.info(
			"API Key Service",
			`Running on:\n  - Local: http://localhost:${port}/api/api-key\n  - Base:  ${apiKeyConfig.BASE_URL}/api/api-key`,
		);
	});

export type ApiKeyService = typeof apiKeyService;
