import { db } from "@reloop/db/client";
import { inboundEmail } from "@reloop/db/schema";
import { eq, and } from "drizzle-orm";
import { useLogger } from "evlog/elysia";
import { createError } from "evlog";

export async function getMessagesController(organizationId: string, mailboxId?: string) {
	let whereClause = eq(inboundEmail.organizationId, organizationId);
	
	if (mailboxId) {
		whereClause = and(whereClause, eq(inboundEmail.mailboxId, mailboxId)) as any;
	}

	const messages = await db.query.inboundEmail.findMany({
		where: whereClause,
		orderBy: (m, { desc }) => [desc(m.createdAt)],
		limit: 50,
	});

	return messages;
}

export async function getMessageController(id: string, organizationId: string) {
	const message = await db.query.inboundEmail.findFirst({
		where: and(eq(inboundEmail.id, id), eq(inboundEmail.organizationId, organizationId)),
		with: {
			attachments: true,
		},
	});

	if (!message) {
		throw createError({
			status: 404,
			message: "Message not found",
			why: `Message ${id} was not found in your organization`,
			fix: "Verify the message ID and ensure it belongs to your organization",
		});
	}
	return message;
}

export async function markMessageReadController(
	id: string,
	organizationId: string,
	isRead: boolean,
) {
	const log = useLogger();

	const msg = await db.query.inboundEmail.findFirst({
		where: and(eq(inboundEmail.id, id), eq(inboundEmail.organizationId, organizationId)),
	});

	if (!msg) {
		throw createError({
			status: 404,
			message: "Message not found",
			why: `Message ${id} was not found in your organization`,
			fix: "Verify the message ID and ensure it belongs to your organization",
		});
	}

	await db
		.update(inboundEmail)
		.set({ isRead })
		.where(eq(inboundEmail.id, id));

	log.info(`[INBOX] Marked message ${id} as ${isRead ? "read" : "unread"}`);
	return { success: true, id, isRead };
}

export async function toggleStarController(
	id: string,
	organizationId: string,
	isStarred: boolean,
) {
	const log = useLogger();

	const msg = await db.query.inboundEmail.findFirst({
		where: and(eq(inboundEmail.id, id), eq(inboundEmail.organizationId, organizationId)),
	});

	if (!msg) {
		throw createError({
			status: 404,
			message: "Message not found",
			why: `Message ${id} was not found in your organization`,
			fix: "Verify the message ID and ensure it belongs to your organization",
		});
	}

	await db
		.update(inboundEmail)
		.set({ isStarred })
		.where(eq(inboundEmail.id, id));

	log.info(`[INBOX] ${isStarred ? "Starred" : "Unstarred"} message ${id}`);
	return { success: true, id, isStarred };
}

export async function deleteMessageController(id: string, organizationId: string) {
	const log = useLogger();
	
	const msg = await db.query.inboundEmail.findFirst({
		where: and(eq(inboundEmail.id, id), eq(inboundEmail.organizationId, organizationId)),
	});

	if (!msg) {
		throw createError({
			status: 404,
			message: "Message not found",
			why: `Message ${id} was not found in your organization`,
			fix: "Verify the message ID and ensure it belongs to your organization",
		});
	}

	await db.delete(inboundEmail).where(eq(inboundEmail.id, id));

	log.info(`[INBOX] Deleted message ${id} (Org: ${organizationId})`);
	return { success: true };
}
