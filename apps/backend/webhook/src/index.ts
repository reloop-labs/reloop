import "dotenv/config";
import { fromTypes, openapi } from "@elysiajs/openapi";
import { serverTiming } from "@elysiajs/server-timing";
import { inngest } from "@reloop/inngest/client";
import { webhookDeliver } from "@reloop/inngest/functions/webhook";
import { logger } from "@reloop/logger";
import { deliveryRoutes } from "@reloop/webhook/routes/delivery/delivery.routes";
import { eventRoutes } from "@reloop/webhook/routes/event/event.routes";
import { landing } from "@reloop/webhook/routes/landing/landing.index";
import { subscriptionRoutes } from "@reloop/webhook/routes/subscription/subscription.routes";
import { webhookRoutes } from "@reloop/webhook/routes/webhook/webhook.routes";
import { Elysia } from "elysia";
import { serve } from "inngest/elysia";

const port = 8013;
const webhookService = new Elysia({
	prefix: "/api/webhook",
	name: "Webhook Service",
})
	.use(
		openapi({
			references: fromTypes(
				process.env.NODE_ENV === "production"
					? "dist/index.d.ts"
					: "src/index.ts",
			),
		}),
	)
	.use(serverTiming())
	.use(
		serve({
			client: inngest,
			functions: [webhookDeliver],
		}),
	)
	.use(landing)
	.use(webhookRoutes)
	.use(eventRoutes)
	.use(subscriptionRoutes)
	.use(deliveryRoutes)
	.listen(port, () => {
		logger.info(
			`Webhook Server is running on http://localhost:${port}/api/webhook`,
		);
	});

export type WebhookService = typeof webhookService;
