import { BusEvent, bus } from "@reloop/bus";
import { appName } from "@reloop/email/brand";
import { emailConfig } from "@reloop/email/email.config";
import StartupApprovedEmail from "@reloop/email/emails/startup-approved";
import { redis } from "@reloop/email/lib/redis";
import { render, toPlainText } from "@reloop/email/render";
import { sendEmail } from "@reloop/email/utils/email";
import { requireReloopSenderDomain } from "@reloop/email/utils/sender-domain";
import { log } from "evlog";
import React from "react";

export async function initStartupSubscribers() {
	await bus.subscribe(
		BusEvent.STARTUP_APPLICATION_APPROVED,
		async (payload) => {
			const dedupKey = `email:startup-approved:${payload.applicationId}`;
			try {
				const alreadySent = await redis.get(dedupKey);
				if (alreadySent) {
					log.warn(
						"server",
						`Duplicate STARTUP_APPLICATION_APPROVED for ${payload.applicationId}, skipping`,
					);
					return;
				}
				await redis.set(dedupKey, "1", 60);

				const html = await render(
					React.createElement(StartupApprovedEmail, {
						fullName: payload.fullName,
						company: payload.company,
						email: payload.email,
						baseUrl: emailConfig.BASE_URL,
					}),
				);

				const text = toPlainText(html);

				await sendEmail({
					from: `${appName} Startups <startups@${requireReloopSenderDomain()}>`,
					to: payload.email,
					subject: `Your ${appName} for Startups application is approved`,
					html,
					text,
				});
			} catch (error) {
				log.error({
					...{ error, applicationId: payload.applicationId },
					message: "Failed to send startup approved email",
				});
			}
		},
		{ queue: "startup-email-worker" },
	);
}
