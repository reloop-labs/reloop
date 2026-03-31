import { authMiddleware } from "@reloop/webhook/middleware/auth";
import { WebhookModel } from "@reloop/webhook/routes/webhook/webhook.model";
import { Elysia, status, t } from "elysia";
import { updateWebhookController } from "./update-webhook.controllers";
import { updateWebhookXCodeSamples } from "./update-webhook.x-codeSamples";

export const updateWebhookRoute = new Elysia().use(authMiddleware).patch(
	"/:id",
	async ({ params: { id }, body, user }) => {
		if (!user.activeOrganizationId) {
			throw status(403, {
				message: "User is not a member of an organization",
			});
		}

		return await updateWebhookController({
			webhookId: id,
			organizationId: user.activeOrganizationId,
			body,
		});
	},
	{
		auth: true,
		params: t.Object({
			id: WebhookModel.webhookIdParam,
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
