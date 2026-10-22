import { BusEvent, bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { appName } from "@reloop/email/brand";
import { emailConfig } from "@reloop/email/email.config";
import ReputationNoticeEmail, {
	reputationNoticeSubject,
} from "@reloop/email/emails/reputation-notice";
import { redis } from "@reloop/email/lib/redis";
import { render, toPlainText } from "@reloop/email/render";
import { sendEmail } from "@reloop/email/utils/email";
import { requireReloopSenderDomain } from "@reloop/email/utils/sender-domain";
import { and, eq, inArray } from "drizzle-orm";
import { log } from "evlog";
import React from "react";

/** Owners and admins can fix list hygiene; plain members just get the dashboard alert. */
const NOTIFIED_ROLES = ["owner", "admin"];

function formatPausedUntil(iso: string): string {
	return `${new Date(iso).toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
		timeZone: "UTC",
	})} UTC`;
}

export async function initReputationSubscribers() {
	await bus.subscribe(
		BusEvent.REPUTATION_NOTICE,
		async (payload) => {
			const dedupKey = `email:reputation-notice:${payload.noticeId}`;
			try {
				if (await redis.get(dedupKey)) return;
				await redis.set(dedupKey, "1", 3600);

				const [org] = await db
					.select({ name: schema.organization.name })
					.from(schema.organization)
					.where(eq(schema.organization.id, payload.organizationId))
					.limit(1);
				const recipients = await db
					.select({ email: schema.user.email, name: schema.user.name })
					.from(schema.member)
					.innerJoin(schema.user, eq(schema.user.id, schema.member.userId))
					.where(
						and(
							eq(schema.member.organizationId, payload.organizationId),
							inArray(schema.member.role, NOTIFIED_ROLES),
						),
					);
				if (!org || recipients.length === 0) {
					log.warn({
						message: "[reputation] No owner/admin to notify",
						organizationId: payload.organizationId,
					});
					return;
				}

				const subject = reputationNoticeSubject(payload);
				const dashboardUrl =
					payload.reason === "complaint_rate"
						? `${emailConfig.BASE_URL}/dashboard/metrics`
						: `${emailConfig.BASE_URL}/dashboard/emails?status=bounced`;

				for (const recipient of recipients) {
					try {
						const html = await render(
							React.createElement(ReputationNoticeEmail, {
								fullName: recipient.name,
								organizationName: org.name,
								level: payload.level,
								reason: payload.reason,
								sent: payload.sent,
								bounced: payload.bounced,
								complaint: payload.complaint,
								bounceRate: payload.bounceRate,
								complaintRate: payload.complaintRate,
								bounceBlockRate: payload.bounceBlockRate,
								complaintBlockRate: payload.complaintBlockRate,
								topBouncingDomains: payload.topBouncingDomains,
								pausedUntil: payload.pausedUntil
									? formatPausedUntil(payload.pausedUntil)
									: null,
								dashboardUrl,
								baseUrl: emailConfig.BASE_URL,
							}),
						);
						await sendEmail({
							from: `${appName} <support@${requireReloopSenderDomain()}>`,
							to: recipient.email,
							subject,
							html,
							text: toPlainText(html),
						});
					} catch (error) {
						log.error({
							error: error instanceof Error ? error.message : String(error),
							organizationId: payload.organizationId,
							email: recipient.email,
							message: "Failed to send reputation notice email",
						});
					}
				}
			} catch (error) {
				log.error({
					error: error instanceof Error ? error.message : String(error),
					organizationId: payload.organizationId,
					noticeId: payload.noticeId,
					message: "Failed to process reputation notice",
				});
			}
		},
		{ queue: "reputation-email-worker" },
	);
}
