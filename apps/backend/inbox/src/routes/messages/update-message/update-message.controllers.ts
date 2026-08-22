import { db } from "@reloop/db/client";
import { emailThread, inboundEmail, threadMessage } from "@reloop/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { createError } from "evlog";
import { useLogger } from "evlog/elysia";
import { broadcastToOrg } from "../../../rooms/inbox.rooms";

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

	// Resolve the canonical conversation id (email_thread.id), not the legacy
	// inbound_email.thread_id header field (In-Reply-To / References).
	const threadLink = await db.query.threadMessage.findFirst({
		where: eq(threadMessage.inboundEmailId, id),
		columns: { threadId: true },
	});
	const canonicalThreadId = threadLink?.threadId ?? null;

	// Read/unread: sync the whole conversation so list + thread flags stay consistent.
	if (updates.isRead !== undefined && canonicalThreadId) {
		await db.transaction(async (tx) => {
			const linked = await tx.query.threadMessage.findMany({
				where: eq(threadMessage.threadId, canonicalThreadId),
				columns: { inboundEmailId: true },
			});
			const inboundIds = [
				...new Set(
					linked
						.map((l) => l.inboundEmailId)
						.filter((v): v is string => !!v)
						.concat(id),
				),
			];

			await tx
				.update(inboundEmail)
				.set({ isRead: updates.isRead })
				.where(
					and(
						inArray(inboundEmail.id, inboundIds),
						eq(inboundEmail.organizationId, organizationId),
					),
				);

			await tx
				.update(emailThread)
				.set({ isRead: updates.isRead })
				.where(
					and(
						eq(emailThread.id, canonicalThreadId),
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
				await tx
					.update(inboundEmail)
					.set(otherFields)
					.where(eq(inboundEmail.id, id));
			}
		});
	} else {
		await db
			.update(inboundEmail)
			.set(updateData)
			.where(eq(inboundEmail.id, id));
	}

	try {
		broadcastToOrg(
			organizationId,
			{
				type: "message_updated",
				data: { id, threadId: canonicalThreadId, ...updateData },
			},
			msg.mailboxId,
		);
	} catch {
		// Non-blocking broadcast
	}

	log.info(`[INBOX] Updated message ${id}: ${JSON.stringify(updateData)}`);
	return { success: true, id, ...updateData };
}
