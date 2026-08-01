import { updateWebhookXCodeSamples } from "@reloop/code-samples/webhook";
import { authMiddleware } from "@reloop/webhook/middleware/auth";
import { WebhookModel } from "@reloop/webhook/routes/webhook/webhook.model";
import type { WebhookTypes } from "@reloop/webhook/routes/webhook/webhook.type";
import { auditLogHook } from "@reloop/webhook/utils/audit-log";
import { Elysia, t } from "elysia";
import { updateWebhookController } from "./update-webhook.controllers";

export const updateWebhookRoute = new Elysia().use(authMiddleware).patch(
	"/:webhook_id",
	async ({ params: { webhook_id }, body, organizationId }) => {
		return await updateWebhookController({
			webhookId: webhook_id,
			organizationId,
			body: body as WebhookTypes.UpdateWebhookRequest,
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
			404: WebhookModel.evlogError,
			409: WebhookModel.evlogError,
			400: WebhookModel.evlogError,
			401: WebhookModel.evlogError,
		},
		afterResponse: auditLogHook({
			resourceType: "webhook",
			action: "updated",
		}),
		detail: {
			tags: ["Webhooks"],
			summary: "Update webhook",
			description: "Updates a webhook by its ID",
			"x-codeSamples": updateWebhookXCodeSamples,
		},
	},
);
