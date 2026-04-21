import "dotenv/config";
import { fromTypes, openapi } from "@elysiajs/openapi";
import { serverTiming } from "@elysiajs/server-timing";
import { logger } from "@reloop/logger";
import { landing } from "@reloop/webhook/routes/landing/landing.index";
import { webhookRoutes } from "@reloop/webhook/routes/webhook/webhook.routes";
import { loader } from "@reloop/webhook/utils/loader";
import { Elysia } from "elysia";
import { webhookConfig } from "./webhook.config";

const port = 8013;

const webhookService = new Elysia({
	prefix: "/api/webhook",
	name: "Webhook Service",
})
	.use(
		openapi({
			path: "/openapi",
			references: fromTypes(
				webhookConfig.NODE_ENV === "production"
					? "dist/index.d.ts"
					: "src/index.ts",
			),
		}),
	)
	.use(serverTiming())
	.use(landing)
	.use(webhookRoutes)
	.onStart(async () => {
		await loader();
	})
	.listen(port, () => {
		logger.info(
			`Webhook Server is running on http://localhost:${port}/api/webhook`,
		);
	});

export type WebhookService = typeof webhookService;

