import { db } from "@reloop/db/client";
import { emailThread } from "@reloop/db/schema";
import { and, eq } from "drizzle-orm";
import { createError } from "evlog";
import { useLogger } from "evlog/elysia";
import { ensureOutboundThreadForEmailLog } from "../../../lib/thread-correlation";
import { updateMessageController } from "../update-message/update-message.controllers";

async function starThreadForEmailLog(
	emailLogId: string,
	organizationId: string,
	isStarred: boolean,
) {
	const log = useLogger();

	const { threadId } = await ensureOutboundThreadForEmailLog({
		emailLogId,
		organizationId,
	});

	const thread = await db.query.emailThread.findFirst({
		where: and(
			eq(emailThread.id, threadId),
			eq(emailThread.organizationId, organizationId),
		),
		columns: { id: true },
	});
	if (!thread) {
		throw createError({
			status: 404,
			message: "Thread not found",
			why: `Thread ${threadId} was not found in your organization`,
			fix: "Verify the thread ID and ensure it belongs to your organization",
		});
	}

	await db
		.update(emailThread)
		.set({ isStarred })
		.where(eq(emailThread.id, threadId));

	log.info(
		`[THREAD] ${isStarred ? "Starred" : "Unstarred"} thread ${threadId} via outbound ${emailLogId}`,
	);
	return { success: true, id: emailLogId, threadId, isStarred };
}

export async function toggleStarController(
	id: string,
	organizationId: string,
	isStarred: boolean,
) {
	// Sent items use email_log ids (eml_…) — ensure a conversation, then star it.
	if (id.startsWith("eml_")) {
		return starThreadForEmailLog(id, organizationId, isStarred);
	}

	try {
		return await updateMessageController(id, organizationId, { isStarred });
	} catch (err) {
		// Fallback: some clients pass an outbound id without the eml_ prefix check.
		try {
			return await starThreadForEmailLog(id, organizationId, isStarred);
		} catch {
			throw err;
		}
	}
}
