import { authMiddleware } from "@reloop/webhook/middleware/auth";
import { WebhookModel } from "@reloop/webhook/routes/webhook/webhook.model";
import { auditLogHook } from "@reloop/webhook/utils/audit-log";
import { Elysia } from "elysia";
import { triggerWebhookController } from "./trigger-webhook.controllers";
import { triggerWebhookXCodeSamples } from "@reloop/code-samples/webhook";

export const triggerWebhookRoute = new Elysia().use(authMiddleware).post(
	"/trigger",
	async ({ body, organizationId, userId }) => {
		return await triggerWebhookController({
			event: body.event,
			payload: body.payload,
			organizationId: body.organizationId || organizationId,
			userId: body.userId || userId,
		});
	},
	{
		auth: true,
		body: WebhookModel.triggerWebhookBody,
		response: {
			200: WebhookModel.triggerWebhookResponse,
			401: WebhookModel.evlogError,
		},
		afterResponse: auditLogHook({
			resourceType: "webhook",
			action: "triggered",
		}),
		detail: {
			tags: ["Webhooks"],
			summary: "Trigger webhooks",
			description: "Triggers webhooks subscribed to a specific event",
			"x-codeSamples": triggerWebhookXCodeSamples,
		},
	},
);
