import { CreditErrors } from "@reloop/credits/error/credits.error-response";
import {
	verifyPolarWebhook,
	WebhookVerificationError,
} from "@reloop/credits/lib/polar";
import { handlePolarWebhookEvent } from "@reloop/credits/lib/polar-webhook";
import { CreditsModel } from "@reloop/credits/model/credits.model";
import { Elysia } from "elysia";
import { log } from "evlog";

export const polarWebhookRoute = new Elysia().post(
	"/v1/webhooks/polar",
	async ({ request }) => {
		const body = await request.text();
		const headers = {
			"webhook-id": request.headers.get("webhook-id") ?? "",
			"webhook-timestamp": request.headers.get("webhook-timestamp") ?? "",
			"webhook-signature": request.headers.get("webhook-signature") ?? "",
		};

		try {
			const event = verifyPolarWebhook({ body, headers });
			const result = await handlePolarWebhookEvent(event);
			if (!result.ok) {
				log.warn({
					message: "Polar webhook accepted but not applied",
					reason: result.reason,
					type: event.type,
				});
			}
			return { received: true as const };
		} catch (error) {
			if (error instanceof WebhookVerificationError) {
				throw CreditErrors.webhookInvalid();
			}
			throw error;
		}
	},
	{
		parse: "none",
		response: {
			200: CreditsModel.webhookAccepted,
		},
		detail: {
			tags: ["Billing"],
			summary: "Polar webhook",
			description:
				"Receives Polar subscription and customer events. Signature is verified with POLAR_WEBHOOK_SECRET.",
		},
	},
);
