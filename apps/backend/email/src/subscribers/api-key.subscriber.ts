import { log } from "evlog";
import { BusEvent, bus } from "@reloop/bus";

import { render } from "../../render";
import { emailConfig } from "../email.config";
import { sendEmail } from "../utils/email";
import ApiKeyCreatedEmail from "../../emails/api-key-created";
import React from "react";

export async function initApiKeySubscribers() {
	// API Key Created
	await bus.subscribe(
		BusEvent.API_KEY_CREATED,
		async (payload) => {
			try {
				const html = await render(
					React.createElement(ApiKeyCreatedEmail, {
						fullName: "User",
						keyName: payload.name,
						keyPrefix: "re_live_", // Fallback prefix
						createdAt: new Date().toLocaleString(),
						ipAddress: "Unknown",
						location: "Unknown",
						manageKeysUrl: `${emailConfig.BASE_URL}/dashboard/api-keys`,
					}),
				);

				await sendEmail({
					from: `Reloop <security@${emailConfig.RELOOP_SENDER_DOMAIN || "reloop.dev"}>`,
					to: payload.userEmail,
					subject: `A new API key "${payload.name}" was created`,
					html,
				});
			} catch (error) {
				log.error({ ...({ error, payload }), message: "Failed to send API key created email" });
			}
		},
		{ queue: "api-key-email-worker" },
	);
}
