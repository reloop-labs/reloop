import { db } from "@reloop/db/client";
import { emailThread } from "@reloop/db/schema";
import { and, eq } from "drizzle-orm";
import { createError } from "evlog";
import { useLogger } from "evlog/elysia";

export async function trashThreadController(
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
		.set({
			status: "trash",
			deletedAt: new Date(),
			snoozedUntil: null,
		})
		.where(eq(emailThread.id, id));

	log.info(`[THREAD] Moved thread ${id} to trash`);
	return { success: true, id, status: "trash" };
}
