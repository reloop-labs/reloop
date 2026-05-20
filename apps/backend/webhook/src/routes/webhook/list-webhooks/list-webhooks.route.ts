import { authMiddleware } from "@reloop/webhook/middleware/auth";
import { WebhookModel } from "@reloop/webhook/routes/webhook/webhook.model";
import { Elysia } from "elysia";
import { listWebhooksController } from "./list-webhooks.controllers";
import { listWebhooksXCodeSamples } from "./list-webhooks.x-codeSamples";

export const listWebhooksRoute = new Elysia().use(authMiddleware).get(
	"/",
	async ({ query, organizationId }) => {
		return await listWebhooksController({
			query,
			organizationId,
		});
	},
	{
		auth: true,
		query: WebhookModel.webhookQuery,
		response: {
			200: WebhookModel.webhookListResponse,
			401: WebhookModel.evlogError,
		},
		detail: {
			tags: ["Webhooks"],
			summary: "List webhooks",
			description: "Lists webhooks for the active organization",
			"x-codeSamples": listWebhooksXCodeSamples,
		},
	},
);
