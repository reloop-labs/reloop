import { authMiddleware } from "@reloop/webhook/middleware/auth";
import { WebhookModel } from "@reloop/webhook/routes/webhook/webhook.model";
import { Elysia, status } from "elysia";
import { createWebhookController } from "./create-webhook.controllers";
import { createWebhookXCodeSamples } from "./create-webhook.x-codeSamples";

export const createWebhookRoute = new Elysia().use(authMiddleware).post(
	"/",
	async ({ body, user }) => {
		if (!user.activeOrganizationId) {
			throw status(403, {
				message: "User is not a member of an organization",
			});
		}

		return await createWebhookController({
			organizationId: user.activeOrganizationId,
			userId: user.id,
			body,
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
