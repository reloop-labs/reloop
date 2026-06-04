import { db } from "@reloop/db/client";
import { inboundEmail } from "@reloop/db/schema";
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

	return messages;
}
