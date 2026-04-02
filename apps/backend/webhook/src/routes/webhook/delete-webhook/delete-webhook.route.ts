import { authMiddleware } from "@reloop/webhook/middleware/auth";
import { WebhookModel } from "@reloop/webhook/routes/webhook/webhook.model";
import { Elysia, status, t } from "elysia";
import { deleteWebhookController } from "./delete-webhook.controllers";
import { deleteWebhookXCodeSamples } from "./delete-webhook.x-codeSamples";

export const deleteWebhookRoute = new Elysia().use(authMiddleware).delete(
	"/:id",
	async ({ params: { id }, activeOrganizationId }) => {
		if (!activeOrganizationId) {
			throw status(403, {
				message: "Authentication required",
			});
		}

		return await deleteWebhookController({
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
			200: WebhookModel.deleteWebhookResponse,
			404: WebhookModel.webhookNotFound,
			403: WebhookModel.unauthorized,
		},
		detail: {
			tags: ["Webhooks"],
			summary: "Delete webhook",
			description: "Soft deletes a webhook by its ID",
			"x-codeSamples": deleteWebhookXCodeSamples,
		},
	},
);
