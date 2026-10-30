import { db } from "@reloop/db/client";
import { emailLog, emailThread } from "@reloop/db/schema";
import { and, eq } from "drizzle-orm";
import { createError } from "evlog";
import { useLogger } from "evlog/elysia";
import {
	ensureOutboundThreadForEmailLog,
	resolveThreadIdForMessage,
} from "../../../lib/thread-correlation";

export async function archiveThreadController(
	id: string,
	organizationId: string,
) {
	const log = useLogger();

	let thread = await db.query.emailThread.findFirst({
		where: and(
			eq(emailThread.id, id),
			eq(emailThread.organizationId, organizationId),
		),
	});

	let targetThreadId = id;

	// Also accept message IDs (inbound, sent, thread message).
	if (!thread) {
		const resolved =
			(await resolveThreadIdForMessage(id, organizationId)) ??
			(await db.query.emailLog
				.findFirst({
					where: and(
						eq(emailLog.id, id),
						eq(emailLog.organizationId, organizationId),
					),
					columns: { id: true },
				})
				.then((outMsg) =>
					outMsg
						? ensureOutboundThreadForEmailLog({
								emailLogId: outMsg.id,
								organizationId,
							}).then((r) => r.threadId)
						: undefined,
				));
		if (resolved) {
			targetThreadId = resolved;
			thread = await db.query.emailThread.findFirst({
				where: and(
					eq(emailThread.id, resolved),
					eq(emailThread.organizationId, organizationId),
				),
			});
		}
	}

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
		.where(eq(emailThread.id, targetThreadId));

	log.info(`[THREAD] Archived thread ${targetThreadId}`);
	return { success: true, id: targetThreadId, status: "archived" };
}
