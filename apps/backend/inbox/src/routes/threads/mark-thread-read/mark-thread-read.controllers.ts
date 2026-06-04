import { db } from "@reloop/db/client";
import { emailThread } from "@reloop/db/schema";
import { and, eq } from "drizzle-orm";
import { createError } from "evlog";
import { useLogger } from "evlog/elysia";

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
