import { db } from "@reloop/db/client";
import { emailLog, emailThread, threadMessage } from "@reloop/db/schema";
import { and, eq } from "drizzle-orm";
import { createError } from "evlog";
import { useLogger } from "evlog/elysia";
import { updateMessageController } from "../update-message/update-message.controllers";

async function starThreadForEmailLog(
	emailLogId: string,
	organizationId: string,
	isStarred: boolean,
) {
	const log = useLogger();

	const owned = await db.query.emailLog.findFirst({
		where: and(
			eq(emailLog.id, emailLogId),
			eq(emailLog.organizationId, organizationId),
		),
		columns: { id: true },
	});
	if (!owned) {
		throw createError({
			status: 404,
			message: "Message not found",
			why: `Message ${emailLogId} was not found in your organization`,
			fix: "Verify the message ID and ensure it belongs to your organization",
		});
	}

	const link = await db.query.threadMessage.findFirst({
		where: eq(threadMessage.emailLogId, emailLogId),
		columns: { threadId: true },
	});
	if (!link?.threadId) {
		throw createError({
			status: 400,
			message: "Can't star this message yet",
			why: `Outbound message ${emailLogId} is not linked to a conversation thread`,
			fix: "Star the conversation from Inbox once it has inbound replies, or open the thread view",
		});
	}

	const thread = await db.query.emailThread.findFirst({
		where: and(
			eq(emailThread.id, link.threadId),
			eq(emailThread.organizationId, organizationId),
		),
		columns: { id: true },
	});
	if (!thread) {
		throw createError({
			status: 404,
			message: "Thread not found",
			why: `Thread ${link.threadId} was not found in your organization`,
			fix: "Verify the thread ID and ensure it belongs to your organization",
		});
	}

	await db
		.update(emailThread)
		.set({ isStarred })
		.where(eq(emailThread.id, link.threadId));

	log.info(
		`[THREAD] ${isStarred ? "Starred" : "Unstarred"} thread ${link.threadId} via outbound ${emailLogId}`,
	);
	return { success: true, id: emailLogId, threadId: link.threadId, isStarred };
}

export async function toggleStarController(
	id: string,
	organizationId: string,
	isStarred: boolean,
) {
	// Sent items use email_log ids (eml_…) — star the linked conversation instead.
	if (id.startsWith("eml_")) {
		return starThreadForEmailLog(id, organizationId, isStarred);
	}

	try {
		return await updateMessageController(id, organizationId, { isStarred });
	} catch (err) {
		// Fallback: some clients pass an outbound id without the eml_ prefix check.
		const link = await db.query.threadMessage.findFirst({
			where: eq(threadMessage.emailLogId, id),
			columns: { threadId: true },
		});
		if (link?.threadId) {
			return starThreadForEmailLog(id, organizationId, isStarred);
		}
		throw err;
	}
}
