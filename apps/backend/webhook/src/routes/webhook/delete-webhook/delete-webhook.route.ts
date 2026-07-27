import { authMiddleware } from "@reloop/webhook/middleware/auth";
import { WebhookModel } from "@reloop/webhook/routes/webhook/webhook.model";
import { auditLogHook } from "@reloop/webhook/utils/audit-log";
import { Elysia, t } from "elysia";
import { deleteWebhookController } from "./delete-webhook.controllers";
import { deleteWebhookXCodeSamples } from "@reloop/code-samples/webhook";

export const deleteWebhookRoute = new Elysia().use(authMiddleware).delete(
	"/:id",
	async ({ params: { id }, organizationId }) => {
		return await deleteWebhookController({
			webhookId: id,
			organizationId,
		});
	},
	{
		auth: true,
		params: t.Object({
			id: WebhookModel.webhookIdParam,
		}),
		response: {
			200: WebhookModel.deleteWebhookResponse,
			404: WebhookModel.evlogError,
			401: WebhookModel.evlogError,
		},
		afterResponse: auditLogHook({
			resourceType: "webhook",
			action: "deleted",
		}),
		detail: {
			tags: ["Webhooks"],
			summary: "Delete webhook",
			description: "Soft deletes a webhook by its ID",
			"x-codeSamples": deleteWebhookXCodeSamples,
		},
	},
);
