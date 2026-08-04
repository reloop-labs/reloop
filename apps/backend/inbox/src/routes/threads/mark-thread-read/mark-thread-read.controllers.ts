import { db } from "@reloop/db/client";
import { emailThread, inboundEmail } from "@reloop/db/schema";
import { and, eq } from "drizzle-orm";
import { createError } from "evlog";
import { useLogger } from "evlog/elysia";

export async function markThreadReadController(
	id: string,
	organizationId: string,
	isRead: boolean,
) {
	const log = useLogger();

	let thread = await db.query.emailThread.findFirst({
		where: and(
			eq(emailThread.id, id),
			eq(emailThread.organizationId, organizationId),
		),
	});

	// Allow passing an inbound message id — resolve to its conversation
	if (!thread) {
		const msg = await db.query.inboundEmail.findFirst({
			where: and(
				eq(inboundEmail.id, id),
				eq(inboundEmail.organizationId, organizationId),
			),
		});
		if (msg?.threadId) {
			thread = await db.query.emailThread.findFirst({
				where: and(
					eq(emailThread.id, msg.threadId),
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

	const threadId = thread.id;

	await db
		.update(emailThread)
		.set({ isRead })
		.where(eq(emailThread.id, threadId));

	// Keep inbound messages in sync so list rows (mapped from messages) update
	await db
		.update(inboundEmail)
		.set({ isRead })
		.where(
			and(
				eq(inboundEmail.threadId, threadId),
				eq(inboundEmail.organizationId, organizationId),
			),
		);

	log.info(
		`[THREAD] Marked thread ${threadId} as ${isRead ? "read" : "unread"}`,
	);
	return { success: true, id: threadId, isRead };
}
