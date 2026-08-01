import { createWebhookXCodeSamples } from "@reloop/code-samples/webhook";
import { authMiddleware } from "@reloop/webhook/middleware/auth";
import { WebhookModel } from "@reloop/webhook/routes/webhook/webhook.model";
import { auditLogHook } from "@reloop/webhook/utils/audit-log";
import type { WebhookEventName } from "@reloop/webhook-events";
import { Elysia } from "elysia";
import { createWebhookController } from "./create-webhook.controllers";

export const createWebhookRoute = new Elysia().use(authMiddleware).post(
	"/",
	async ({ body, organizationId, userId }) => {
		return await createWebhookController({
			organizationId,
			userId,
			description: body.description,
			url: body.url,
			events: body.events as WebhookEventName[],
		});
	},
	{
		auth: true,
		body: WebhookModel.createWebhookBody,
		response: {
			201: WebhookModel.webhookResponse,
			400: WebhookModel.evlogError,
			409: WebhookModel.evlogError,
			401: WebhookModel.evlogError,
		},
		afterResponse: auditLogHook({
			resourceType: "webhook",
			action: "created",
			successStatus: 201,
		}),
		detail: {
			tags: ["Webhooks"],
			summary: "Create webhook",
			description: "Creates a new webhook for the active organization",
			"x-codeSamples": createWebhookXCodeSamples,
		},
	},
);
