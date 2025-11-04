import { authMiddleware } from "@reloop/webhook/middleware/auth";
import { deleteWebhookHandler } from "@reloop/webhook/routes/webhook/controllers/delete-webhook";
import { WebhookModel } from "@reloop/webhook/routes/webhook/webhook.model";
import { Elysia, status, t } from "elysia";

export const deleteWebhookRoute = new Elysia().use(authMiddleware).delete(
	"/:id",
	async ({ params: { id }, user }) => {
		if (!user.activeOrganizationId) {
			throw status(403, {
				message: "User is not a member of an organization",
			});
		}
		return await deleteWebhookHandler(id, user.activeOrganizationId);
	},
	{
		auth: true,
		params: t.Object({
			id: WebhookModel.webhookIdParam,
		}),
		response: {
			200: t.Object({
				message: t.String(),
			}),
			404: WebhookModel.webhookNotFound,
			403: WebhookModel.unauthorized,
		},
		detail: {
			tags: ["Webhooks"],
			summary: "Delete webhook",
			description: "Soft deletes a webhook by its ID",
		},
	},
);
