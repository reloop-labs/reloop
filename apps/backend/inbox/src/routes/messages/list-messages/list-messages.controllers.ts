import { db } from "@reloop/db/client";
import { inboundEmail, threadMessage } from "@reloop/db/schema";
import { and, eq } from "drizzle-orm";

export async function getMessagesController(
	organizationId: string,
	mailboxId?: string,
) {
	const conditions = [eq(inboundEmail.organizationId, organizationId)];

	if (mailboxId) {
		conditions.push(eq(inboundEmail.mailboxId, mailboxId));
	}

	const whereClause = and(...conditions);

	const messages = await db.query.inboundEmail.findMany({
		where: whereClause,
		orderBy: (m, { desc }) => [desc(m.createdAt)],
		limit: 50,
		with: {
			attachments: true,
		},
	});

	// Enrich each message with the real thr_xxx thread ID from the
	// threadMessage join table (inboundEmail.threadId holds the raw
	// RFC822 In-Reply-To string, not the DB thread ID).
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
