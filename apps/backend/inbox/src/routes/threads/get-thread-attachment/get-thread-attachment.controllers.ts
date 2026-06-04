import { db } from "@reloop/db/client";
import { emailThread, inboundAttachment } from "@reloop/db/schema";
import { and, eq } from "drizzle-orm";
import { createError } from "evlog";

export async function getThreadAttachmentController(
	threadId: string,
	attachmentId: string,
	organizationId: string,
) {
	// Verify thread access
	const thread = await db.query.emailThread.findFirst({
		where: and(
			eq(emailThread.id, threadId),
			eq(emailThread.organizationId, organizationId),
		),
	});

	if (!thread) {
		throw createError({
			status: 404,
			message: "Thread not found",
			why: `Thread ${threadId} was not found in your organization`,
			fix: "Verify the thread ID and ensure it belongs to your organization",
		});
	}

	// Find the attachment
	const attachment = await db.query.inboundAttachment.findFirst({
		where: eq(inboundAttachment.id, attachmentId),
	});

	if (!attachment) {
		throw createError({
			status: 404,
			message: "Attachment not found",
			why: `Attachment ${attachmentId} was not found`,
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
