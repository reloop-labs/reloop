import { authMiddleware } from "@reloop/webhook/middleware/auth";
import { WebhookModel } from "@reloop/webhook/routes/webhook/webhook.model";
import { Elysia, status, t } from "elysia";
import { getWebhookController } from "./get-webhook.controllers";
import { getWebhookXCodeSamples } from "./get-webhook.x-codeSamples";

export const getWebhookRoute = new Elysia().use(authMiddleware).get(
	"/:id",
	async ({ params: { id }, activeOrganizationId }) => {
		if (!activeOrganizationId) {
			throw status(403, {
				message: "Authentication required",
			});
		}

		return await getWebhookController({
			webhookId: id,
			organizationId: activeOrganizationId,
		});
	},
	{
		auth: true,
		params: t.Object({
			id: WebhookModel.webhookIdParam,
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
