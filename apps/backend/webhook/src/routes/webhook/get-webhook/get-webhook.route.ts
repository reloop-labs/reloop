import { authMiddleware } from "@reloop/webhook/middleware/auth";
import { WebhookModel } from "@reloop/webhook/routes/webhook/webhook.model";
import { Elysia, t } from "elysia";
import { getWebhookController } from "./get-webhook.controllers";
import { getWebhookXCodeSamples } from "./get-webhook.x-codeSamples";

export const getWebhookRoute = new Elysia().use(authMiddleware).get(
	"/:webhook_id",
	async ({ params: { webhook_id }, organizationId }) => {
		return await getWebhookController({
			webhookId: webhook_id,
			organizationId,
		});
	},
	{
		auth: true,
		params: t.Object({
			webhook_id: WebhookModel.webhookIdParam,
		}),
		response: {
			200: WebhookModel.webhookResponse,
			404: WebhookModel.webhookNotFound,
			403: WebhookModel.unauthorized,
		},
		detail: {
			tags: ["Webhooks"],
			summary: "Retrieves webhook",
			description: "Retrieves a webhook by its ID",
			"x-codeSamples": getWebhookXCodeSamples,
		},
	},
);
