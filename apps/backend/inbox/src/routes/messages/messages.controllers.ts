import { db } from "@reloop/db/client";
import { inboundEmail } from "@reloop/db/schema";
import { error } from "elysia";
import { eq, and } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

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
	});

	if (!message) return error(404, "Message not found");
	return message;
}

export async function deleteMessageController(id: string, organizationId: string) {
	const log = useLogger();
	
	const msg = await db.query.inboundEmail.findFirst({
		where: and(eq(inboundEmail.id, id), eq(inboundEmail.organizationId, organizationId)),
	});

	if (!msg) return error(404, "Message not found");

	await db.delete(inboundEmail).where(eq(inboundEmail.id, id));

	log.info(`[INBOX] Deleted message ${id} (Org: ${organizationId})`);
	return { success: true };
}
