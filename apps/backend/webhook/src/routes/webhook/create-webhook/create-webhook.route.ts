import { authMiddleware } from "@reloop/webhook/middleware/auth";
import { WebhookModel } from "@reloop/webhook/routes/webhook/webhook.model";
import type { WebhookEventName } from "@reloop/webhook-events";
import { Elysia } from "elysia";
import { createWebhookController } from "./create-webhook.controllers";
import { createWebhookXCodeSamples } from "./create-webhook.x-codeSamples";

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
			409: WebhookModel.webhookAlreadyExists,
			400: WebhookModel.invalidWebhookUrl,
			403: WebhookModel.unauthorized,
		},
		detail: {
			tags: ["Webhooks"],
			summary: "Create webhook",
			description: "Creates a new webhook for the active organization",
			"x-codeSamples": createWebhookXCodeSamples,
		},
	},
);
