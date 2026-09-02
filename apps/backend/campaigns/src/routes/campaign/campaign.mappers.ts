import type { Campaign, CampaignRecipient } from "@reloop/db/schema";

function iso(value: Date | null | undefined): string | undefined {
	return value ? value.toISOString() : undefined;
}

export function toCampaignResponse(
	row: Campaign,
	templateName?: string | null,
) {
	return {
		id: row.id,
		organizationId: row.organizationId,
		name: row.name,
		subject: row.subject,
		previewText: row.previewText ?? undefined,
		fromName: row.fromName,
		fromEmail: row.fromEmail,
		replyTo: row.replyTo ?? undefined,
		status: row.status,
		audienceType: row.audienceType,
		audienceTargetId: row.audienceTargetId ?? undefined,
		audienceTargetName: row.audienceTargetName ?? undefined,
		recipientCount: row.recipientCount,
		sentCount: row.sentCount,
		deliveredCount: row.deliveredCount,
		openedCount: row.openedCount,
		clickedCount: row.clickedCount,
		failedCount: row.failedCount,
		skippedCount: row.skippedCount,
		templateId: row.templateId ?? undefined,
		templateName: templateName ?? undefined,
		content: Array.isArray(row.content) ? row.content : [],
		contentHtml: row.contentHtml,
		scheduledAt: iso(row.scheduledAt),
		sentAt: iso(row.sentAt),
		createdAt: row.createdAt.toISOString(),
		updatedAt: row.updatedAt.toISOString(),
		lastError: row.lastError ?? undefined,
	};
}

export function toRecipientResponse(row: CampaignRecipient) {
	return {
		id: row.id,
		email: row.email,
		contactId: row.contactId ?? undefined,
		status: row.status,
		skipReason: row.skipReason ?? undefined,
		emailLogId: row.emailLogId ?? undefined,
		openedAt: iso(row.openedAt),
		clickedAt: iso(row.clickedAt),
	};
}
