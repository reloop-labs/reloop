import { db } from "@reloop/db/client";
import { emailLog, inboundAttachment, inboundEmail } from "@reloop/db/schema";
import { and, eq } from "drizzle-orm";
import { createError } from "evlog";
import { mapEmailLogAttachments } from "../../../lib/outbound-attachments";

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
		createdAt: outbound.createdAt,
	};
}
