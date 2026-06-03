import { db } from "@reloop/db/client";
import {
	emailLog,
	emailThread,
	inboundAttachment,
	inboundEmail,
	threadMessage,
} from "@reloop/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { createError } from "evlog";
import { useLogger } from "evlog/elysia";

export async function getThreadsController(
	organizationId: string,
	mailboxId?: string,
	limit = 50,
	offset = 0,
) {
	const conditions = [eq(emailThread.organizationId, organizationId)];

	if (mailboxId) {
		conditions.push(eq(emailThread.mailboxId, mailboxId));
	}

	const threads = await db.query.emailThread.findMany({
		where: and(...conditions),
		orderBy: [desc(emailThread.lastMessageAt)],
		limit,
		offset,
	});

	return threads;
}

export async function getThreadController(id: string, organizationId: string) {
	const log = useLogger();

	const thread = await db.query.emailThread.findFirst({
		where: and(
			eq(emailThread.id, id),
			eq(emailThread.organizationId, organizationId),
		),
		with: {
			messages: {
				orderBy: [desc(threadMessage.messageAt)],
			},
		},
	});

	if (!thread) {
		throw createError({
			status: 404,
			message: "Thread not found",
			why: `Thread ${id} was not found in your organization`,
			fix: "Verify the thread ID and ensure it belongs to your organization",
		});
	}

	// Hydrate each message with its full inbound/outbound data
	const hydratedMessages = await Promise.all(
		thread.messages.map(async (msg) => {
			if (msg.direction === "inbound" && msg.inboundEmailId) {
				const email = await db.query.inboundEmail.findFirst({
					where: eq(inboundEmail.id, msg.inboundEmailId),
					with: { attachments: true },
				});
				return {
					...msg,
					email: email
						? {
								id: email.id,
								fromEmail: email.fromEmail,
								toEmails: email.toEmails,
								subject: email.subject,
								textBody: email.textBody,
								htmlBody: email.htmlBody,
								isRead: email.isRead,
								isStarred: email.isStarred,
								attachments: email.attachments,
								createdAt: email.createdAt,
							}
						: null,
				};
			}

			if (msg.direction === "outbound" && msg.emailLogId) {
				const email = await db.query.emailLog.findFirst({
					where: eq(emailLog.id, msg.emailLogId),
				});
				return {
					...msg,
					email: email
						? {
								id: email.id,
								fromEmail: email.fromEmail,
								fromName: email.fromName,
								toEmails: email.toEmails,
								ccEmails: email.ccEmails,
								subject: email.subject,
								textBody: email.textBody,
								htmlBody: email.htmlBody,
								status: email.status,
								sentAt: email.sentAt,
								createdAt: email.createdAt,
							}
						: null,
				};
			}

			return { ...msg, email: null };
		}),
	);

	return {
		...thread,
		messages: hydratedMessages,
	};
}

export async function markThreadReadController(
	id: string,
	organizationId: string,
	isRead: boolean,
) {
	const log = useLogger();

	const thread = await db.query.emailThread.findFirst({
		where: and(
			eq(emailThread.id, id),
			eq(emailThread.organizationId, organizationId),
		),
	});

	if (!thread) {
		throw createError({
			status: 404,
			message: "Thread not found",
			why: `Thread ${id} was not found in your organization`,
			fix: "Verify the thread ID and ensure it belongs to your organization",
		});
	}

	await db.update(emailThread).set({ isRead }).where(eq(emailThread.id, id));

	log.info(`[THREAD] Marked thread ${id} as ${isRead ? "read" : "unread"}`);
	return { success: true, id, isRead };
}

export async function toggleThreadStarController(
	id: string,
	organizationId: string,
	isStarred: boolean,
) {
	const log = useLogger();

	const thread = await db.query.emailThread.findFirst({
		where: and(
			eq(emailThread.id, id),
			eq(emailThread.organizationId, organizationId),
		),
	});

	if (!thread) {
		throw createError({
			status: 404,
			message: "Thread not found",
			why: `Thread ${id} was not found in your organization`,
			fix: "Verify the thread ID and ensure it belongs to your organization",
		});
	}

	await db.update(emailThread).set({ isStarred }).where(eq(emailThread.id, id));

	log.info(`[THREAD] ${isStarred ? "Starred" : "Unstarred"} thread ${id}`);
	return { success: true, id, isStarred };
}

export async function archiveThreadController(
	id: string,
	organizationId: string,
) {
	const log = useLogger();

	const thread = await db.query.emailThread.findFirst({
		where: and(
			eq(emailThread.id, id),
			eq(emailThread.organizationId, organizationId),
		),
	});

	if (!thread) {
		throw createError({
			status: 404,
			message: "Thread not found",
			why: `Thread ${id} was not found in your organization`,
			fix: "Verify the thread ID and ensure it belongs to your organization",
		});
	}

	await db
		.update(emailThread)
		.set({ status: "archived" })
		.where(eq(emailThread.id, id));

	log.info(`[THREAD] Archived thread ${id}`);
	return { success: true, id, status: "archived" };
}

export async function updateThreadController(
	id: string,
	organizationId: string,
	updates: {
		isRead?: boolean;
		isStarred?: boolean;
		status?: "active" | "archived" | "closed";
	},
) {
	const log = useLogger();

	const thread = await db.query.emailThread.findFirst({
		where: and(
			eq(emailThread.id, id),
			eq(emailThread.organizationId, organizationId),
		),
	});

	if (!thread) {
		throw createError({
			status: 404,
			message: "Thread not found",
			why: `Thread ${id} was not found in your organization`,
			fix: "Verify the thread ID and ensure it belongs to your organization",
		});
	}

	const updateData: Record<string, any> = {};
	if (updates.isRead !== undefined) updateData.isRead = updates.isRead;
	if (updates.isStarred !== undefined) updateData.isStarred = updates.isStarred;
	if (updates.status !== undefined) updateData.status = updates.status;

	if (Object.keys(updateData).length === 0) {
		return { success: true, id, message: "No changes" };
	}

	await db.update(emailThread).set(updateData).where(eq(emailThread.id, id));

	log.info(`[THREAD] Updated thread ${id}: ${JSON.stringify(updateData)}`);
	return { success: true, id, ...updateData };
}

export async function deleteThreadController(
	id: string,
	organizationId: string,
) {
	const log = useLogger();

	const thread = await db.query.emailThread.findFirst({
		where: and(
			eq(emailThread.id, id),
			eq(emailThread.organizationId, organizationId),
		),
	});

	if (!thread) {
		throw createError({
			status: 404,
			message: "Thread not found",
			why: `Thread ${id} was not found in your organization`,
			fix: "Verify the thread ID and ensure it belongs to your organization",
		});
	}

	// Cascade will handle thread_message deletion
	await db.delete(emailThread).where(eq(emailThread.id, id));

	log.info(`[THREAD] Deleted thread ${id} (Org: ${organizationId})`);
	return { success: true };
}

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

