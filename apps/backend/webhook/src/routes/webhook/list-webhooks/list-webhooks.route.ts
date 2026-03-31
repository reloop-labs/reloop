import { authMiddleware } from "@reloop/webhook/middleware/auth";
import { WebhookModel } from "@reloop/webhook/routes/webhook/webhook.model";
import { Elysia, status } from "elysia";
import { listWebhooksController } from "./list-webhooks.controllers";
import { listWebhooksXCodeSamples } from "./list-webhooks.x-codeSamples";

export const listWebhooksRoute = new Elysia().use(authMiddleware).get(
	"/",
	async ({ query, user }) => {
		if (!user.activeOrganizationId) {
			throw status(403, {
				message: "User is not a member of an organization",
			});
		}

		return await listWebhooksController({
			query,
			organizationId: user.activeOrganizationId,
		});
	},
	{
		auth: true,
		query: WebhookModel.webhookQuery,
		response: {
			200: WebhookModel.webhookListResponse,
			403: WebhookModel.unauthorized,
		},
		detail: {
			tags: ["Webhooks"],
			summary: "List webhooks",
			description: "Lists webhooks for the active organization",
			"x-codeSamples": listWebhooksXCodeSamples,
		},
	},
);
