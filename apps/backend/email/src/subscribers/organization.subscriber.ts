import { BusEvent, bus } from "@reloop/bus";
import { logger } from "@reloop/logger";
import { render } from "../../render";
import { emailConfig } from "../email.config";
import { sendEmail } from "../utils/email";
import InviteEmail from "../../emails/invite";
import OrgJoinedEmail from "../../emails/org-joined";
import React from "react";

export async function initOrgSubscribers() {
	// Invite Email
	await bus.subscribe(BusEvent.INVITE_CREATED, async (payload) => {
		try {
			const html = await render(
				React.createElement(InviteEmail, {
					inviteeName: "User", // We don't have the invitee name yet, usually just email
					inviterName: payload.inviterName,
					inviterEmail: payload.inviterEmail,
					teamName: payload.organizationName,
					role: payload.role,
					inviteUrl: payload.inviteLink,
				}),
			);

			await sendEmail({
				from: `Reloop <invites@${emailConfig.RELOOP_SENDER_DOMAIN || "reloop.dev"}>`,
				to: payload.email,
				subject: `You've been invited to join ${payload.organizationName} on Reloop`,
				html,
			});
		} catch (error) {
			logger.error({ error, payload }, "Failed to send invite email");
		}
	});

	// Organization Joined Email
	await bus.subscribe(BusEvent.ORGANIZATION_JOINED, async (payload) => {
		try {
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
				from: `Reloop <org@${emailConfig.RELOOP_SENDER_DOMAIN || "reloop.dev"}>`,
				to: payload.userEmail,
				subject: "You've successfully joined the organization",
				html,
			});
		} catch (error) {
			logger.error({ error, payload }, "Failed to send org joined email");
		}
	});
}
