import { db } from "@reloop/db/client";
import { emailThread, inboundEmail } from "@reloop/db/schema";
import { and, eq } from "drizzle-orm";
import { createError } from "evlog";
import { useLogger } from "evlog/elysia";

export async function updateMessageController(
	id: string,
	organizationId: string,
	updates: {
		isRead?: boolean;
		isStarred?: boolean;
		isSpam?: boolean;
	},
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

	const updateData: Partial<typeof inboundEmail.$inferInsert> = {};
	if (updates.isRead !== undefined) updateData.isRead = updates.isRead;
	if (updates.isStarred !== undefined) updateData.isStarred = updates.isStarred;
	if (updates.isSpam !== undefined) {
		updateData.isSpam = updates.isSpam;
		updateData.status = updates.isSpam ? "spam" : "received";
	}

	if (Object.keys(updateData).length === 0) {
		return { success: true, id, message: "No changes" };
	}

	// Read/unread: sync the whole conversation so list + thread flags stay consistent.
	// Opening one message should clear unread for the entire thread.
	if (updates.isRead !== undefined && msg.threadId) {
		await db
			.update(inboundEmail)
			.set({ isRead: updates.isRead })
			.where(
				and(
					eq(inboundEmail.threadId, msg.threadId),
					eq(inboundEmail.organizationId, organizationId),
				),
			);

		await db
			.update(emailThread)
			.set({ isRead: updates.isRead })
			.where(
				and(
					eq(emailThread.id, msg.threadId),
					eq(emailThread.organizationId, organizationId),
				),
			);

		// Apply non-read fields only on the targeted message
		const otherFields: Partial<typeof inboundEmail.$inferInsert> = {};
		if (updates.isStarred !== undefined)
			otherFields.isStarred = updates.isStarred;
		if (updates.isSpam !== undefined) {
			otherFields.isSpam = updates.isSpam;
			otherFields.status = updates.isSpam ? "spam" : "received";
		}
		if (Object.keys(otherFields).length > 0) {
			await db
				.update(inboundEmail)
				.set(otherFields)
				.where(eq(inboundEmail.id, id));
		}
	} else {
		await db
			.update(inboundEmail)
			.set(updateData)
			.where(eq(inboundEmail.id, id));
	}

	log.info(`[INBOX] Updated message ${id}: ${JSON.stringify(updateData)}`);
	return { success: true, id, ...updateData };
}
