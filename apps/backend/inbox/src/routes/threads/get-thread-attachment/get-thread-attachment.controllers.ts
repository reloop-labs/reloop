import { db } from "@reloop/db/client";
import {
	emailThread,
	inboundAttachment,
	inboundEmail,
	threadMessage,
} from "@reloop/db/schema";
import { and, eq } from "drizzle-orm";
import { createError } from "evlog";
import { attachmentDownloadUrl } from "../../messages/get-message-attachment/get-message-attachment.controllers";

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

	// The attachment must be on a message in this thread (and this org);
	// a bare ID lookup would expose any org's attachment.
	const owner = attachment
		? await db.query.inboundEmail.findFirst({
				where: and(
					eq(inboundEmail.id, attachment.inboundEmailId),
					eq(inboundEmail.organizationId, organizationId),
				),
				columns: { id: true, threadId: true },
			})
		: undefined;
	const inThread =
		owner &&
		(owner.threadId === threadId ||
			(await db.query.threadMessage.findFirst({
				where: and(
					eq(threadMessage.threadId, threadId),
					eq(threadMessage.inboundEmailId, owner.id),
				),
				columns: { id: true },
			})));

	if (!attachment || !inThread) {
		throw createError({
			status: 404,
			message: "Attachment not found",
			why: `Attachment ${attachmentId} was not found in thread ${threadId}`,
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
		downloadUrl: attachmentDownloadUrl(
			attachment.inboundEmailId,
			attachment.id,
		),
		createdAt: attachment.createdAt,
	};
}
