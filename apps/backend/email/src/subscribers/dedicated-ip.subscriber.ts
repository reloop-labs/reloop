import { BusEvent, bus } from "@reloop/bus";
import { appName } from "@reloop/email/brand";
import { emailConfig } from "@reloop/email/email.config";
import DedicatedIpAssignedEmail from "@reloop/email/emails/dedicated-ip-assigned";
import { redis } from "@reloop/email/lib/redis";
import { render, toPlainText } from "@reloop/email/render";
import { sendEmail } from "@reloop/email/utils/email";
import { requireReloopSenderDomain } from "@reloop/email/utils/sender-domain";
import { log } from "evlog";
import React from "react";

export async function initDedicatedIpSubscribers() {
	await bus.subscribe(
		BusEvent.DEDICATED_IP_OWNER_NOTIFIED,
		async (payload) => {
			// Guards a double click; an admin can re-notify after a minute.
			const dedupKey = `email:dedicated-ip-notified:${payload.assignmentId}`;
			try {
				const alreadySent = await redis.get(dedupKey);
				if (alreadySent) {
					log.warn(
						"server",
						`Duplicate DEDICATED_IP_OWNER_NOTIFIED for ${payload.assignmentId}, skipping`,
					);
					return;
				}
				await redis.set(dedupKey, "1", 60);

				const html = await render(
					React.createElement(DedicatedIpAssignedEmail, {
						fullName: payload.ownerName,
						organizationName: payload.organizationName,
						address: payload.address,
						hostname: payload.hostname,
						warmup: payload.warmup,
						dashboardUrl: `${emailConfig.BASE_URL}/dashboard/settings/dedicated-ip`,
						baseUrl: emailConfig.BASE_URL,
					}),
				);

				const text = toPlainText(html);

				await sendEmail({
					from: `${appName} <support@${requireReloopSenderDomain()}>`,
					to: payload.ownerEmail,
					subject: `${payload.organizationName} now has a dedicated sending IP`,
					html,
					text,
				});
			} catch (error) {
				log.error({
					...{ error, assignmentId: payload.assignmentId },
					message: "Failed to send dedicated IP email",
				});
			}
		},
		{ queue: "dedicated-ip-email-worker" },
	);
}
