import { BusEvent, bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { emailConfig } from "@reloop/email/email.config";
import ApiKeyCreatedEmail from "@reloop/email/emails/api-key-created";
import { render } from "@reloop/email/render";
import { sendEmail } from "@reloop/email/utils/email";
import { eq } from "drizzle-orm";
import { log } from "evlog";
import React from "react";

export async function initApiKeySubscribers() {
	// API Key Created
	await bus.subscribe(
		BusEvent.API_KEY_CREATED,
		async (payload) => {
			try {
				const apiKey = await db.query.apikey.findFirst({
					where: eq(schema.apikey.id, payload.api_key_id),
					with: {
						user: true,
					},
				});

				if (!apiKey) {
					log.error(
						"subscriber",
						`API key not found for ID: ${payload.api_key_id}`,
					);
					return;
				}

				if (!apiKey.user) {
					log.error(
						"subscriber",
						`User not found for API key: ${payload.api_key_id}`,
					);
					return;
				}

				const html = await render(
					React.createElement(ApiKeyCreatedEmail, {
						fullName: apiKey.user.name || "User",
						keyName: apiKey.name || "Unnamed Key",
						keyPrefix: apiKey.prefix || "re_live_",
						createdAt: apiKey.createdAt.toLocaleString(),
						ipAddress: "Unknown",
						location: "Unknown",
						manageKeysUrl: `${emailConfig.BASE_URL}/dashboard/api-keys`,
					}),
				);

				await sendEmail({
					from: `Reloop <security@${emailConfig.RELOOP_SENDER_DOMAIN || "reloop.dev"}>`,
					to: apiKey.user.email,
					subject: `A new API key "${apiKey.name}" was created`,
					html,
				});
			} catch (error) {
				log.error({
					...{ error, payload },
					message: "Failed to send API key created email",
				});
			}
		},
		{ queue: "api-key-email-worker" },
	);
}
