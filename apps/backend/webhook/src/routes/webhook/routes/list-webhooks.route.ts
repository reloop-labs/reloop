import { authMiddleware } from "@reloop/webhook/middleware/auth";
import { listWebhooksHandler } from "@reloop/webhook/routes/webhook/controllers/list-webhooks";
import { WebhookModel } from "@reloop/webhook/routes/webhook/webhook.model";
import { Elysia, status } from "elysia";

export const listWebhooksRoute = new Elysia().use(authMiddleware).get(
	"/list",
	async ({ query, user }) => {
		if (!user.activeOrganizationId) {
			throw status(403, {
				message: "User is not a member of an organization",
			});
		}
		return await listWebhooksHandler(query, user.activeOrganizationId);
	},
	{
		query: WebhookModel.webhookQuery,
		response: {
			200: WebhookModel.webhookListResponse,
			403: WebhookModel.unauthorized,
		},
		auth: true,
		detail: {
			tags: ["Webhooks"],
			summary: "List webhooks",
			description:
				"Retrieves a paginated list of webhooks with optional filters",
		},
	},
);
