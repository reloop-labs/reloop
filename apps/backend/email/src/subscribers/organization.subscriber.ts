import { BusEvent, bus } from "@reloop/bus";
import { log } from "evlog";

import React from "react";
import InviteEmail from "../../emails/invite";
import OrgJoinedEmail from "../../emails/org-joined";
import { render } from "../../render";
import { emailConfig } from "../email.config";
import { redis } from "../lib/redis";
import { sendEmail } from "../utils/email";

export async function initOrgSubscribers() {
	// Invite Email
	await bus.subscribe(
		BusEvent.INVITE_CREATED,
		async (payload) => {
			const dedupKey = `email:invite:${payload.email}:${payload.organizationName}`;
			try {
				const alreadySent = await redis.get(dedupKey);
				if (alreadySent && !payload.isResend) {
					log.warn(
						"server",
						`Duplicate INVITE_CREATED for ${payload.email}, skipping`,
					);
					return;
				}
				await redis.set(dedupKey, "1", 60);

				const html = await render(
					React.createElement(InviteEmail, {
						inviteeName: payload.email.split("@")[0], // Fallback to email prefix if name is missing
						inviterName: payload.inviterName,
						inviterEmail: payload.inviterEmail,
						teamName: payload.organizationName,
						inviteUrl: payload.inviteLink,
					}),
				);

				await sendEmail({
					from: `${payload.inviterName} via Reloop <invites@${emailConfig.RELOOP_SENDER_DOMAIN || "reloop.dev"}>`,
					to: payload.email,
					subject: `Join ${payload.organizationName} on Reloop`,
					html,
				});
			} catch (error) {
				log.error({
					...{ error, payload },
					message: "Failed to send invite email",
				});
			}
		},
		{ queue: "org-email-worker" },
	);

	// Organization Joined Email
	await bus.subscribe(
		BusEvent.ORGANIZATION_JOINED,
		async (payload) => {
			const dedupKey = `email:org_joined:${payload.userEmail}:${payload.orgName}`;
			try {
				const alreadySent = await redis.get(dedupKey);
				if (alreadySent) {
					log.warn(
						"server",
						`Duplicate ORGANIZATION_JOINED for ${payload.userEmail}, skipping`,
					);
					return;
				}
				await redis.set(dedupKey, "1", 60);

				const html = await render(
					React.createElement(OrgJoinedEmail, {
						memberName: payload.memberName,
						orgName: payload.orgName,
						role: payload.role,
						inviterName: payload.inviterName,
						dashboardUrl: `${emailConfig.BASE_URL}/dashboard`,
					}),
				);

				await sendEmail({
					from: `${payload.orgName} via Reloop <org@${emailConfig.RELOOP_SENDER_DOMAIN || "reloop.dev"}>`,
					to: payload.userEmail,
					subject: `You're now part of the ${payload.orgName} team!`,
					html,
				});
			} catch (error) {
				log.error({
					...{ error, payload },
					message: "Failed to send org joined email",
				});
			}
		},
		{ queue: "org-email-worker" },
	);
}
