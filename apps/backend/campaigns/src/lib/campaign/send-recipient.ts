import {
	htmlToText,
	skipReasonForContact,
} from "@be/campaigns/lib/campaign/audience";
import { maybeCompleteCampaign } from "@be/campaigns/lib/campaign/dispatch";
import {
	campaignMergeVars,
	interpolate,
} from "@be/campaigns/lib/campaign/interpolate";
import { sendCampaignMail } from "@be/campaigns/lib/campaign/send-mail";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { log } from "evlog";

export async function sendCampaignRecipient(
	recipientId: string,
): Promise<void> {
	const recipient = await db.query.campaignRecipient.findFirst({
		where: eq(schema.campaignRecipient.id, recipientId),
	});
	if (!recipient) return;
	if (recipient.emailLogId || recipient.status === "sent") {
		await maybeCompleteCampaign(recipient.campaignId);
		return;
	}
	if (recipient.status === "skipped" || recipient.status === "failed") {
		await maybeCompleteCampaign(recipient.campaignId);
		return;
	}

	const campaign = await db.query.campaign.findFirst({
		where: eq(schema.campaign.id, recipient.campaignId),
	});
	if (!campaign || campaign.status === "cancelled" || campaign.deletedAt) {
		return;
	}

	if (recipient.contactId) {
		const contact = await db.query.contact.findFirst({
			where: eq(schema.contact.id, recipient.contactId),
		});
		const skip = contact
			? skipReasonForContact(contact)
			: ("unsubscribed" as const);
		if (skip) {
			await markSkipped(recipient.id, campaign.id, skip);
			await maybeCompleteCampaign(campaign.id);
			return;
		}
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

	const contact = recipient.contactId
		? await db.query.contact.findFirst({
				where: eq(schema.contact.id, recipient.contactId),
			})
		: null;

	const vars = campaignMergeVars({
		email: recipient.email,
		firstName: contact?.firstName,
		lastName: contact?.lastName,
		properties: (contact?.properties as Record<string, any>) ?? null,
	});
	const subject = interpolate(campaign.subject, vars);
	const html = interpolate(campaign.contentHtml, vars);
	const text = htmlToText(html) || subject;
	const from = campaign.fromName
		? `${campaign.fromName} <${campaign.fromEmail}>`
		: campaign.fromEmail;

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
			headers: campaign.replyTo
				? { "List-Unsubscribe": `<mailto:${campaign.replyTo}>` }
				: undefined,
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
			throw error;
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
	}

	await maybeCompleteCampaign(campaign.id);
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
