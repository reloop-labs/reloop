import { db } from "@reloop/db/client";
import { inboundEmail } from "@reloop/db/schema";
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

	await db.update(inboundEmail).set(updateData).where(eq(inboundEmail.id, id));

	log.info(`[INBOX] Updated message ${id}: ${JSON.stringify(updateData)}`);
	return { success: true, id, ...updateData };
}
