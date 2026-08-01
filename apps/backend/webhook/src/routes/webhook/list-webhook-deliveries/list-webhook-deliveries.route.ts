import { listWebhookDeliveriesXCodeSamples } from "@reloop/code-samples/webhook";
import { authMiddleware } from "@reloop/webhook/middleware/auth";
import { WebhookModel } from "@reloop/webhook/routes/webhook/webhook.model";
import { Elysia, t } from "elysia";
import { listWebhookDeliveriesController } from "./list-webhook-deliveries.controllers";

export const listWebhookDeliveriesRoute = new Elysia().use(authMiddleware).get(
	"/:webhook_id/deliveries",
	async ({ params: { webhook_id }, query, organizationId }) => {
		return await listWebhookDeliveriesController({
			webhookId: webhook_id,
			organizationId,
			query: query as WebhookModel.WebhookDeliveryQuery,
		});
	},
	{
		auth: true,
		params: t.Object({
			webhook_id: WebhookModel.webhookIdParam,
		}),
		query: WebhookModel.webhookDeliveryQuery,
		response: {
			200: WebhookModel.webhookDeliveryListResponse,
			401: WebhookModel.evlogError,
			404: WebhookModel.evlogError,
		},
		detail: {
			tags: ["Webhooks"],
			summary: "List webhook deliveries",
			description:
				"Fetches a paginated list of delivery attempts for a specific webhook",
			"x-codeSamples": listWebhookDeliveriesXCodeSamples,
		},
	},
);
