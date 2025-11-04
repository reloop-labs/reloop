import { authMiddleware } from "@reloop/webhook/middleware/auth";
import { updateWebhookHandler } from "@reloop/webhook/routes/webhook/controllers/update-webhook";
import { WebhookModel } from "@reloop/webhook/routes/webhook/webhook.model";
import { Elysia, status, t } from "elysia";

export const updateWebhookRoute = new Elysia().use(authMiddleware).put(
	"/:id",
	async ({ params: { id }, body, user }) => {
		if (!user.activeOrganizationId) {
			throw status(403, {
				message: "User is not a member of an organization",
			});
		}
		return await updateWebhookHandler(id, user.activeOrganizationId, body);
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
		},
	},
);
