import { authMiddleware } from "@reloop/webhook/middleware/auth";
import { WebhookModel } from "@reloop/webhook/routes/webhook/webhook.model";
import { Elysia } from "elysia";
import { signTestEventController } from "./sign-test-event.controllers";

export const signTestEventRoute = new Elysia().use(authMiddleware).post(
	"/sign-test-event",
	async ({ body, organizationId }) => {
		return await signTestEventController({
			webhookId: body.webhookId,
			event: body.event,
			payload: body.payload,
			organizationId: body.organizationId || organizationId,
		});
	},
	{
		auth: true,
		body: WebhookModel.signTestEventBody,
		response: {
			200: WebhookModel.signTestEventResponse,
			401: WebhookModel.evlogError,
		},
		// NOTE: Intentionally NO auditLogHook here! Test event triggers do not log event actions.
		detail: {
			tags: ["Webhooks"],
			summary: "Sign test webhook event",
			description:
				"Generates signed headers and body for sending a test webhook directly from the client without storing event actions or delivery records",
		},
	},
);
