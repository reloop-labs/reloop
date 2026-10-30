import { db } from "@reloop/db/client";
import { emailThread, inboundEmail, threadMessage } from "@reloop/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { createError } from "evlog";
import { useLogger } from "evlog/elysia";
import { resolveThreadIdForMessage } from "../../../lib/thread-correlation";

export async function deleteThreadController(
	id: string,
	organizationId: string,
) {
	const log = useLogger();

	// Accept message IDs too, like the other thread routes.
	const threadId = (await resolveThreadIdForMessage(id, organizationId)) ?? id;
	const thread = await db.query.emailThread.findFirst({
		where: and(
			eq(emailThread.id, threadId),
			eq(emailThread.organizationId, organizationId),
		),
	});

	if (!thread) {
		// A standalone received message has no thread row; delete it directly.
		const [standalone] = await db
			.delete(inboundEmail)
			.where(
				and(
					eq(inboundEmail.id, id),
					eq(inboundEmail.organizationId, organizationId),
				),
			)
			.returning({ id: inboundEmail.id });
		if (standalone) {
			log.info(`[THREAD] Deleted standalone message ${id}`);
			return { success: true };
		}

		throw createError({
			status: 404,
			message: "Thread not found",
			why: `Thread ${id} was not found in your organization`,
			fix: "Verify the thread ID and ensure it belongs to your organization",
		});
	}

	const links = await db.query.threadMessage.findMany({
		where: eq(threadMessage.threadId, thread.id),
		columns: { inboundEmailId: true },
	});
	const inboundIds = links
		.map((l) => l.inboundEmailId)
		.filter((v): v is string => !!v);

	// thread_message rows cascade. Received emails go too, or they resurface
	// as standalone messages; sent email logs stay (they are the send log).
	await db.transaction(async (tx) => {
		await tx.delete(emailThread).where(eq(emailThread.id, thread.id));
		if (inboundIds.length > 0) {
			await tx
				.delete(inboundEmail)
				.where(
					and(
						inArray(inboundEmail.id, inboundIds),
						eq(inboundEmail.organizationId, organizationId),
					),
				);
		}
	});

	log.info(`[THREAD] Deleted thread ${thread.id} (Org: ${organizationId})`);
	return { success: true };
}
