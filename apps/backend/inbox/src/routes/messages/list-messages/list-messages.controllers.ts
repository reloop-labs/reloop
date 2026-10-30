import { db } from "@reloop/db/client";
import { inboundEmail, threadMessage } from "@reloop/db/schema";
import { and, desc, eq, ilike, inArray, or } from "drizzle-orm";

export async function getMessagesController(
	organizationId: string,
	mailboxId?: string,
	limit = 100,
	offset = 0,
	q?: string,
	isSpam?: boolean,
	/** Restricts to these mailboxes (API key scope). undefined = no restriction. */
	mailboxIds?: string[],
) {
	if (mailboxIds && mailboxIds.length === 0) return [];

	const conditions = [eq(inboundEmail.organizationId, organizationId)];

	if (mailboxId) {
		conditions.push(eq(inboundEmail.mailboxId, mailboxId));
	}
	if (mailboxIds) {
		conditions.push(inArray(inboundEmail.mailboxId, mailboxIds));
	}

	if (isSpam !== undefined) {
		conditions.push(eq(inboundEmail.isSpam, isSpam));
	}

	if (q?.trim()) {
		const term = `%${q.trim()}%`;
		conditions.push(
			or(
				ilike(inboundEmail.subject, term),
				ilike(inboundEmail.snippet, term),
				ilike(inboundEmail.fromEmail, term),
				ilike(inboundEmail.fromName, term),
			)!,
		);
	}

	const messages = await db.query.inboundEmail.findMany({
		where: and(...conditions),
		orderBy: [desc(inboundEmail.createdAt)],
		limit: Math.min(limit, 200),
		offset,
		columns: { rawMessage: false },
		with: {
			attachments: true,
		},
	});

	const enriched = await Promise.all(
		messages.map(async (msg) => {
			const tm = await db.query.threadMessage.findFirst({
				where: eq(threadMessage.inboundEmailId, msg.id),
				columns: { threadId: true },
			});
			return { ...msg, threadId: tm?.threadId ?? null };
		}),
	);

	return enriched;
}
