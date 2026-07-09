import { db } from "@reloop/db/client";
import { emailThread } from "@reloop/db/schema";
import { and, eq } from "drizzle-orm";
import { createError } from "evlog";
import { useLogger } from "evlog/elysia";

export async function updateThreadController(
	id: string,
	organizationId: string,
	updates: {
		isRead?: boolean;
		isStarred?: boolean;
		isImportant?: boolean;
		status?: "active" | "archived" | "closed" | "trash";
	},
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

	const updateData: Partial<typeof emailThread.$inferInsert> = {};
	if (updates.isRead !== undefined) updateData.isRead = updates.isRead;
	if (updates.isStarred !== undefined) updateData.isStarred = updates.isStarred;
	if (updates.isImportant !== undefined)
		updateData.isImportant = updates.isImportant;
	if (updates.status !== undefined) {
		updateData.status = updates.status;
		if (updates.status === "trash") {
			updateData.deletedAt = new Date();
			updateData.snoozedUntil = null;
		} else if (updates.status === "active") {
			updateData.deletedAt = null;
		}
	}

	if (Object.keys(updateData).length === 0) {
		return { success: true, id, message: "No changes" };
	}

	await db.update(emailThread).set(updateData).where(eq(emailThread.id, id));

	log.info(`[THREAD] Updated thread ${id}: ${JSON.stringify(updateData)}`);
	return {
		success: true,
		id,
		...(updates.isRead !== undefined ? { isRead: updates.isRead } : {}),
		...(updates.isStarred !== undefined ? { isStarred: updates.isStarred } : {}),
		...(updates.isImportant !== undefined
			? { isImportant: updates.isImportant }
			: {}),
		...(updates.status !== undefined ? { status: updates.status } : {}),
	};
}
