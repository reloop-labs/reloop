import { authMiddleware } from "@reloop/webhook/middleware/auth";
import { WebhookModel } from "@reloop/webhook/routes/webhook/webhook.model";
import { Elysia } from "elysia";
import { sendTestEventController } from "./send-test-event.controllers";

export const sendTestEventRoute = new Elysia().use(authMiddleware).post(
	"/send-test-event",
	async ({ body, organizationId }) => {
		return await sendTestEventController({
			webhookId: body.webhookId,
			event: body.event,
			payload: body.payload,
			listenerSessionId: body.listenerSessionId,
			organizationId,
		});
	},
	{
		auth: true,
		body: WebhookModel.sendTestEventBody,
		response: {
			200: WebhookModel.sendTestEventResponse,
			401: WebhookModel.evlogError,
		},
		// NOTE: Intentionally NO auditLogHook here! Test event triggers do not log event actions.
		detail: {
			tags: ["Webhooks"],
			summary: "Send test webhook event",
			description:
				"Signs a test event and delivers it from Reloop's servers to the webhook URL, or to a `reloop webhooks listen` session. Returns the endpoint's response. No event actions or delivery records are stored.",
		},
	},
);
