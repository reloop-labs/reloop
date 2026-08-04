import { db } from "@reloop/db/client";
import { emailThread, inboundEmail, threadMessage } from "@reloop/db/schema";
import { and, eq, inArray } from "drizzle-orm";
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
		if (msg) {
			const link = await db.query.threadMessage.findFirst({
				where: eq(threadMessage.inboundEmailId, msg.id),
				columns: { threadId: true },
			});
			const threadId = link?.threadId ?? msg.threadId;
			if (threadId) {
				thread = await db.query.emailThread.findFirst({
					where: and(
						eq(emailThread.id, threadId),
						eq(emailThread.organizationId, organizationId),
					),
				});
			}
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

	// Keep thread + inbound messages consistent in one transaction.
	await db.transaction(async (tx) => {
		await tx
			.update(emailThread)
			.set({ isRead })
			.where(eq(emailThread.id, threadId));

		const linked = await tx.query.threadMessage.findMany({
			where: eq(threadMessage.threadId, threadId),
			columns: { inboundEmailId: true },
		});
		const inboundIds = linked
			.map((l) => l.inboundEmailId)
			.filter((v): v is string => !!v);

		if (inboundIds.length > 0) {
			await tx
				.update(inboundEmail)
				.set({ isRead })
				.where(
					and(
						inArray(inboundEmail.id, inboundIds),
						eq(inboundEmail.organizationId, organizationId),
					),
				);
		} else {
			// Legacy path for messages only keyed by inbound_email.thread_id
			await tx
				.update(inboundEmail)
				.set({ isRead })
				.where(
					and(
						eq(inboundEmail.threadId, threadId),
						eq(inboundEmail.organizationId, organizationId),
					),
				);
		}
	});

	log.info(
		`[THREAD] Marked thread ${threadId} as ${isRead ? "read" : "unread"}`,
	);
	return { success: true, id: threadId, isRead };
}
