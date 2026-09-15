import {
	htmlToText,
	skipReasonForContact,
} from "@be/campaigns/lib/campaign/audience";
import { maybeCompleteCampaign } from "@be/campaigns/lib/campaign/complete";
import {
	campaignMergeVars,
	interpolate,
} from "@be/campaigns/lib/campaign/interpolate";
import { sendCampaignMail } from "@be/campaigns/lib/campaign/send-mail";
import {
	appendUnsubscribeFooter,
	campaignListHeaders,
	oneClickUnsubscribeUrl,
	resolveUnsubscribeBase,
	signPreferencesToken,
	unsubscribePageUrl,
} from "@be/campaigns/lib/campaign/unsubscribe";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq, isNotNull, or, sql } from "drizzle-orm";
import { log } from "evlog";

export type SendRecipientResult =
	| { outcome: "sent" | "skipped" | "failed" | "ignored" | "quota_exceeded" }
	| { outcome: "rate_limited"; retryAfterSeconds?: number };

export async function sendCampaignRecipient(
	recipientId: string,
): Promise<SendRecipientResult> {
	const recipient = await db.query.campaignRecipient.findFirst({
		where: eq(schema.campaignRecipient.id, recipientId),
	});
	if (!recipient) return { outcome: "ignored" };
	if (recipient.emailLogId || recipient.status === "sent") {
		await maybeCompleteCampaign(recipient.campaignId);
		return { outcome: "ignored" };
	}
	if (recipient.status === "skipped" || recipient.status === "failed") {
		await maybeCompleteCampaign(recipient.campaignId);
		return { outcome: "ignored" };
	}

	const campaign = await db.query.campaign.findFirst({
		where: eq(schema.campaign.id, recipient.campaignId),
	});
	if (!campaign || campaign.status === "cancelled" || campaign.deletedAt) {
		return { outcome: "ignored" };
	}

	const contact = recipient.contactId
		? await db.query.contact.findFirst({
				where: eq(schema.contact.id, recipient.contactId),
			})
		: null;
	const skip =
		(contact ? skipReasonForContact(contact) : null) ??
		(await platformSuppressionSkip(recipient.email, recipient.organizationId));
	if (skip) {
		await markSkipped(recipient.id, campaign.id, skip);
		await maybeCompleteCampaign(campaign.id);
		return { outcome: "skipped" };
	}

	await db
		.update(schema.campaignRecipient)
		.set({ status: "sending", updatedAt: new Date() })
		.where(
			and(
				eq(schema.campaignRecipient.id, recipient.id),
				eq(schema.campaignRecipient.status, "pending"),
			),
		);

	// Per-recipient unsubscribe URLs. Only contacts on the main list carry a
	// signed token — CSV recipients without a contactId keep today's behavior.
	// The base is the sender's tracking domain when enabled, else the Reloop
	// links host, so the unsubscribe domain matches the sender family.
	let unsubscribeUrl: string | null = null;
	let oneClickUrl: string | null = null;
	if (contact) {
		const token = await signPreferencesToken({
			contactId: contact.id,
			organizationId: campaign.organizationId,
		});
		const base = await resolveUnsubscribeBase({
			organizationId: campaign.organizationId,
			from: campaign.fromEmail,
		});
		unsubscribeUrl = unsubscribePageUrl(token, base);
		oneClickUrl = oneClickUnsubscribeUrl(token, base);
	}

	const vars = campaignMergeVars({
		email: recipient.email,
		firstName: contact?.firstName,
		lastName: contact?.lastName,
		properties: ((contact as any)?.properties as Record<string, any>) ?? null,
		unsubscribeUrl,
	});
	const subject = interpolate(campaign.subject, vars);
	// Auto-append the unsubscribe footer when the content has none, so every
	// campaign carries a working main-list unsubscribe link.
	const htmlWithFooter = unsubscribeUrl
		? appendUnsubscribeFooter(campaign.contentHtml, unsubscribeUrl)
		: campaign.contentHtml;
	const html = interpolate(htmlWithFooter, vars);
	const text = htmlToText(html) || subject;
	const from = campaign.fromName
		? `${campaign.fromName} <${campaign.fromEmail}>`
		: campaign.fromEmail;

	const headers = campaignListHeaders({
		oneClickUrl,
		from: campaign.fromEmail,
		replyTo: campaign.replyTo,
		campaignId: campaign.id,
	});

	try {
		const result = await sendCampaignMail({
			organizationId: campaign.organizationId,
			userId: campaign.userId,
			from,
			to: recipient.email,
			subject,
			html,
			text,
			replyTo: campaign.replyTo,
			tags: [{ name: "campaign", value: campaign.id }],
			templateId: campaign.contentHtml ? null : campaign.templateId,
			headers: Object.keys(headers).length > 0 ? headers : undefined,
		});

		await db
			.update(schema.campaignRecipient)
			.set({
				status: "sent",
				emailLogId: result.emailLogId ?? null,
				updatedAt: new Date(),
			})
			.where(eq(schema.campaignRecipient.id, recipient.id));

		await db
			.update(schema.campaign)
			.set({
				sentCount: sql`${schema.campaign.sentCount} + 1`,
				updatedAt: new Date(),
			})
			.where(eq(schema.campaign.id, campaign.id));
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		const status = (error as { status?: number }).status;
		log.error({
			message: "Campaign recipient send failed",
			recipientId: recipient.id,
			campaignId: campaign.id,
			error: message,
			status,
		});

		if (status === 429 || status === 402) {
			await db
				.update(schema.campaignRecipient)
				.set({ status: "pending", error: message, updatedAt: new Date() })
				.where(eq(schema.campaignRecipient.id, recipient.id));
			await db
				.update(schema.campaign)
				.set({ lastError: message, updatedAt: new Date() })
				.where(eq(schema.campaign.id, campaign.id));
			if (status === 402) return { outcome: "quota_exceeded" };
			return {
				outcome: "rate_limited",
				retryAfterSeconds: (error as { retryAfterSeconds?: number })
					.retryAfterSeconds,
			};
		}

		await db
			.update(schema.campaignRecipient)
			.set({
				status: "failed",
				error: message,
				updatedAt: new Date(),
			})
			.where(eq(schema.campaignRecipient.id, recipient.id));
		await db
			.update(schema.campaign)
			.set({
				failedCount: sql`${schema.campaign.failedCount} + 1`,
				lastError: message,
				updatedAt: new Date(),
			})
			.where(eq(schema.campaign.id, campaign.id));
		await maybeCompleteCampaign(campaign.id);
		return { outcome: "failed" };
	}

	await maybeCompleteCampaign(campaign.id);
	return { outcome: "sent" };
}

/**
 * Reloop auto-suppression: if this org already marked this address as
 * hard-bounced / not found (or blocked), skip sending for this campaign.
 * Suppression is org-scoped — another org's suppression must never cause
 * a skip here. Unsubscribe stays org-local and is not applied here.
 */
async function platformSuppressionSkip(
	email: string,
	organizationId: string,
): Promise<"suppressed" | "blocked" | null> {
	const normalized = email.trim().toLowerCase();
	if (!normalized) return null;
	const rows = await db
		.select({
			status: schema.contact.status,
			suppressionReason: schema.contact.suppressionReason,
		})
		.from(schema.contact)
		.where(
			and(
				eq(schema.contact.organizationId, organizationId),
				eq(schema.contact.email, normalized),
				or(
					eq(schema.contact.status, "blocked"),
					isNotNull(schema.contact.suppressionReason),
				),
			),
		)
		.limit(8);
	if (rows.some((row) => row.status === "blocked")) return "blocked";
	if (rows.some((row) => row.suppressionReason)) return "suppressed";
	return null;
}

async function markSkipped(
	recipientId: string,
	campaignId: string,
	reason: "unsubscribed" | "blocked" | "suppressed",
) {
	await db
		.update(schema.campaignRecipient)
		.set({
			status: "skipped",
			skipReason: reason,
			updatedAt: new Date(),
		})
		.where(eq(schema.campaignRecipient.id, recipientId));
	await db
		.update(schema.campaign)
		.set({
			skippedCount: sql`${schema.campaign.skippedCount} + 1`,
			updatedAt: new Date(),
		})
		.where(eq(schema.campaign.id, campaignId));
}
