import { db } from "@reloop/db/client";
import { inboundEmail, threadMessage } from "@reloop/db/schema";
import { and, eq } from "drizzle-orm";
import { createError } from "evlog";
import { useLogger } from "evlog/elysia";
import { recomputeThread } from "../../../lib/thread-maintenance";

export async function deleteMessageController(
	id: string,
	organizationId: string,
) {
	const log = useLogger();

	const msg = await db.query.inboundEmail.findFirst({
		where: and(
			eq(inboundEmail.id, id),
			eq(inboundEmail.organizationId, organizationId),
		),
	});

	if (!msg) {
		throw createError({
			status: 404,
			message: "Message not found",
			why: `Message ${id} was not found in your organization`,
			fix: "Verify the message ID and ensure it belongs to your organization",
		});
	}

	const links = await db.query.threadMessage.findMany({
		where: eq(threadMessage.inboundEmailId, id),
		columns: { threadId: true },
	});

	// thread_message rows cascade; the threads' counters must follow.
	await db.delete(inboundEmail).where(eq(inboundEmail.id, id));
	for (const threadId of new Set(links.map((l) => l.threadId))) {
		await recomputeThread(threadId);
	}

	log.info(`[INBOX] Deleted message ${id} (Org: ${organizationId})`);
	return { success: true };
}
