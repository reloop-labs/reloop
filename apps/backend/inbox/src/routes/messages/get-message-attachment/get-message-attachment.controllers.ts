import { db } from "@reloop/db/client";
import { emailLog, inboundAttachment, inboundEmail } from "@reloop/db/schema";
import { and, eq } from "drizzle-orm";
import { createError } from "evlog";
import {
	attachmentResponse,
	extractInboundAttachmentContent,
} from "../../../lib/inbound-attachment-content";
import { mapEmailLogAttachments } from "../../../lib/outbound-attachments";

export const attachmentDownloadUrl = (
	messageId: string,
	attachmentId: string,
) =>
	`/api/inbox/v1/messages/${encodeURIComponent(messageId)}/attachments/${encodeURIComponent(attachmentId)}/content`;

export async function getMessageAttachmentController(
	messageId: string,
	attachmentId: string,
	organizationId: string,
) {
	const inbound = await db.query.inboundEmail.findFirst({
		where: and(
			eq(inboundEmail.id, messageId),
			eq(inboundEmail.organizationId, organizationId),
		),
	});

	if (inbound) {
		const attachment = await db.query.inboundAttachment.findFirst({
			where: and(
				eq(inboundAttachment.id, attachmentId),
				eq(inboundAttachment.inboundEmailId, messageId),
			),
		});

		if (!attachment) {
			throw createError({
				status: 404,
				message: "Attachment not found",
				why: `Attachment ${attachmentId} was not found on message ${messageId}`,
				fix: "Verify the attachment ID",
			});
		}

		return {
			id: attachment.id,
			filename: attachment.filename,
			contentType: attachment.contentType,
			size: attachment.size,
			storagePath: attachment.storagePath,
			contentDisposition: attachment.contentDisposition,
			contentId: attachment.contentId,
			downloadUrl: attachmentDownloadUrl(messageId, attachment.id),
			createdAt: attachment.createdAt,
		};
	}

	const outbound = await db.query.emailLog.findFirst({
		where: and(
			eq(emailLog.id, messageId),
			eq(emailLog.organizationId, organizationId),
		),
	});

	if (!outbound) {
		throw createError({
			status: 404,
			message: "Message not found",
			why: `Message ${messageId} was not found in your organization`,
			fix: "Verify the message ID and ensure it belongs to your organization",
		});
	}

	const attachment = mapEmailLogAttachments(outbound.attachments).find(
		(att) => att.id === attachmentId,
	);
	if (!attachment) {
		throw createError({
			status: 404,
			message: "Attachment not found",
			why: `Attachment ${attachmentId} was not found on message ${messageId}`,
			fix: "Verify the attachment ID",
		});
	}

	return {
		id: attachment.id,
		filename: attachment.filename,
		contentType: attachment.contentType,
		size: attachment.size,
		storagePath: attachment.storagePath,
		contentDisposition: attachment.contentDisposition,
		contentId: attachment.contentId,
		downloadUrl: attachmentDownloadUrl(messageId, attachment.id),
		createdAt: outbound.createdAt,
	};
}

const attachmentNotFound = (messageId: string, attachmentId: string) =>
	createError({
		status: 404,
		message: "Attachment not found",
		why: `Attachment ${attachmentId} was not found on message ${messageId}`,
		fix: "Verify the attachment ID",
	});

/**
 * Stream an attachment's bytes. Inbound bytes are re-extracted from the
 * stored raw message; outbound ones redirect to where the upload lives.
 */
export async function getMessageAttachmentContentController(
	messageId: string,
	attachmentId: string,
	organizationId: string,
	inline: boolean,
): Promise<Response> {
	const inbound = await db.query.inboundEmail.findFirst({
		where: and(
			eq(inboundEmail.id, messageId),
			eq(inboundEmail.organizationId, organizationId),
		),
		columns: { id: true, rawMessage: true },
	});

	if (inbound) {
		const attachment = await db.query.inboundAttachment.findFirst({
			where: and(
				eq(inboundAttachment.id, attachmentId),
				eq(inboundAttachment.inboundEmailId, messageId),
			),
		});
		if (!attachment) throw attachmentNotFound(messageId, attachmentId);
		if (!inbound.rawMessage) {
			throw createError({
				status: 404,
				message: "Attachment content not available",
				why: "The raw message for this email was not stored, so the attachment bytes cannot be recovered",
				fix: "Ask the sender to resend the email",
			});
		}
		const file = await extractInboundAttachmentContent(inbound.rawMessage, {
			filename: attachment.filename,
			contentType: attachment.contentType,
			size: attachment.size,
			contentId: attachment.contentId,
			checksum: attachment.checksum,
		});
		if (!file) throw attachmentNotFound(messageId, attachmentId);
		return attachmentResponse(file, inline);
	}

	const outbound = await db.query.emailLog.findFirst({
		where: and(
			eq(emailLog.id, messageId),
			eq(emailLog.organizationId, organizationId),
		),
		columns: { attachments: true },
	});
	if (!outbound) {
		throw createError({
			status: 404,
			message: "Message not found",
			why: `Message ${messageId} was not found in your organization`,
			fix: "Verify the message ID and ensure it belongs to your organization",
		});
	}
	const attachment = mapEmailLogAttachments(outbound.attachments).find(
		(att) => att.id === attachmentId,
	);
	const path = attachment?.storagePath.trim();
	if (!attachment || !path) throw attachmentNotFound(messageId, attachmentId);
	const location = /^https?:\/\//i.test(path)
		? path
		: `/api/upload/v1/files/content?path=${encodeURIComponent(path)}`;
	return new Response(null, { status: 302, headers: { location } });
}
