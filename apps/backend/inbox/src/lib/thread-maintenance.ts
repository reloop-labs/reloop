import { db } from "@reloop/db/client";
import { emailThread, threadMessage } from "@reloop/db/schema";
import { count, desc, eq } from "drizzle-orm";

/**
 * Re-derive a thread's counters from the messages it still has, after one
 * was removed. A thread left with no messages is deleted.
 */
export async function recomputeThread(threadId: string): Promise<void> {
	const [remaining] = await db
		.select({ n: count() })
		.from(threadMessage)
		.where(eq(threadMessage.threadId, threadId));
	const total = remaining?.n ?? 0;

	if (total === 0) {
		await db.delete(emailThread).where(eq(emailThread.id, threadId));
		return;
	}

	const latest = await db.query.threadMessage.findFirst({
		where: eq(threadMessage.threadId, threadId),
		orderBy: [desc(threadMessage.messageAt)],
		columns: { preview: true, messageAt: true },
	});
	await db
		.update(emailThread)
		.set({
			messageCount: total,
			lastMessageAt: latest?.messageAt,
			lastMessagePreview: latest?.preview ?? "",
		})
		.where(eq(emailThread.id, threadId));
}
