import { authMiddleware } from "@reloop/webhook/middleware/auth";
import { WebhookModel } from "@reloop/webhook/routes/webhook/webhook.model";
import { Elysia, t } from "elysia";
import { updateWebhookController } from "./update-webhook.controllers";
import { updateWebhookXCodeSamples } from "./update-webhook.x-codeSamples";

export const updateWebhookRoute = new Elysia().use(authMiddleware).patch(
	"/:webhook_id",
	async ({ params: { webhook_id }, body, activeOrganizationId }) => {
		return await updateWebhookController({
			webhookId: webhook_id,
			organizationId: activeOrganizationId,
			body,
		});
	},
	{
		auth: true,
		params: t.Object({
			webhook_id: WebhookModel.webhookIdParam,
		}),
		body: WebhookModel.updateWebhookBody,
		response: {
			200: WebhookModel.webhookResponse,
			404: WebhookModel.webhookNotFound,
			409: WebhookModel.webhookAlreadyExists,
			400: WebhookModel.invalidWebhookUrl,
			403: WebhookModel.unauthorized,
		},
		detail: {
			tags: ["Webhooks"],
			summary: "Update webhook",
			description: "Updates a webhook by its ID",
			"x-codeSamples": updateWebhookXCodeSamples,
		},
	},
);
