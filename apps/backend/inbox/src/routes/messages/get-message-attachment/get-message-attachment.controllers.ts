import { db } from "@reloop/db/client";
import { inboundAttachment, inboundEmail } from "@reloop/db/schema";
import { and, eq } from "drizzle-orm";
import { createError } from "evlog";

export async function getMessageAttachmentController(
	messageId: string,
	attachmentId: string,
	organizationId: string,
) {
	// Verify message access
	const message = await db.query.inboundEmail.findFirst({
		where: and(
			eq(inboundEmail.id, messageId),
			eq(inboundEmail.organizationId, organizationId),
		),
	});

	if (!message) {
		throw createError({
			status: 404,
			message: "Message not found",
			why: `Message ${messageId} was not found in your organization`,
			fix: "Verify the message ID and ensure it belongs to your organization",
		});
	}

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
