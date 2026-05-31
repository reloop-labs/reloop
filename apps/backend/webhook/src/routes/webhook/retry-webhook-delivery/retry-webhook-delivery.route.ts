import { authMiddleware } from "@reloop/webhook/middleware/auth";
import { WebhookModel } from "@reloop/webhook/routes/webhook/webhook.model";
import { Elysia, t } from "elysia";
import { retryWebhookDeliveryController } from "./retry-webhook-delivery.controllers";

export const retryWebhookDeliveryRoute = new Elysia().use(authMiddleware).post(
	"/deliveries/:delivery_id/retry",
	async ({ params: { delivery_id }, organizationId }) => {
		return await retryWebhookDeliveryController({
			deliveryId: delivery_id,
			organizationId,
		});
	},
	{
		auth: true,
		params: t.Object({
			delivery_id: t.String({
				minLength: 1,
				description: "Webhook Delivery ID",
			}),
		}),
		response: {
			200: t.Object({
				success: t.Boolean(),
				message: t.String(),
			}),
			401: WebhookModel.evlogError,
			404: WebhookModel.evlogError,
		},
		detail: {
			tags: ["Webhooks"],
			summary: "Retry webhook delivery",
			description: "Manually re-enqueues a specific webhook delivery attempt",
		},
	},
);
