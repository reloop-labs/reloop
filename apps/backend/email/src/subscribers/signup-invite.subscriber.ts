import { BusEvent, bus } from "@reloop/bus";
import { emailConfig } from "@reloop/email/email.config";
import SignupInviteEmail from "@reloop/email/emails/signup-invite";
import { redis } from "@reloop/email/lib/redis";
import { render, toPlainText } from "@reloop/email/render";
import { sendEmail } from "@reloop/email/utils/email";
import { log } from "evlog";
import React from "react";

export async function initSignupInviteSubscribers() {
	await bus.subscribe(
		BusEvent.SIGNUP_INVITE_CREATED,
		async (payload) => {
			const dedupKey = `email:signup_invite:${payload.email}:${payload.inviteCode}`;
			try {
				const alreadySent = await redis.get(dedupKey);
				if (alreadySent) {
					log.warn(
						"server",
						`Duplicate SIGNUP_INVITE_CREATED for ${payload.email}, skipping`,
					);
					return;
				}
				await redis.set(dedupKey, "1", 60);

				const html = await render(
					React.createElement(SignupInviteEmail, {
						inviteeName: payload.email.split("@")[0],
						inviterName: payload.inviterName,
						inviterEmail: payload.inviterEmail,
						inviteUrl: payload.inviteLink,
						inviteCode: payload.inviteCode,
					}),
				);

				const text = toPlainText(html);

				await sendEmail({
					from: `${payload.inviterName} via Reloop <invites@${emailConfig.RELOOP_SENDER_DOMAIN || "reloop.dev"}>`,
					to: payload.email,
					subject: "You're invited to join Reloop",
					html,
					text,
				});
			} catch (error) {
				log.error({
					...{ error, payload },
					message: "Failed to send signup invite email",
				});
			}
		},
		{ queue: "signup-invite-email-worker" },
	);
}
