import "dotenv/config";
import { openapi } from "@elysiajs/openapi";
import { serverTiming } from "@elysiajs/server-timing";

import { agentCardRoute } from "@reloop/webhook/routes/landing/agent-card.route";
import { healthRoute } from "@reloop/webhook/routes/landing/health.route";
import { landingRoute } from "@reloop/webhook/routes/landing/landing.route";
import { webhookRoutes } from "@reloop/webhook/routes/webhook/webhook.routes";
import { loader } from "@reloop/webhook/utils/loader";
import { Elysia } from "elysia";
import { initLogger, log, parseError } from "evlog";
import { evlog } from "evlog/elysia";
import { webhookConfig } from "./webhook.config";

initLogger({ env: { service: "webhook" } });

const port = webhookConfig.port;

const webhookService = new Elysia({
	prefix: "/api/webhook",
	name: "Webhook Service",
})
	.use(evlog())
	.use(
		openapi({
			documentation: {
				info: {
					title: "Webhook Service",
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
	.use(healthRoute)
	.use(agentCardRoute)
	.use(webhookRoutes)
	.onStart(async () => {
		await loader();
	})
	.listen(port, () => {
		log.info(
			"Webhook Service",
			`Running on:\n  - Local: http://localhost:${port}/api/webhook\n  - Base:  ${webhookConfig.BASE_URL}/api/webhook`,
		);
	});

export type WebhookService = typeof webhookService;
