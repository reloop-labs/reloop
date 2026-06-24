import { db } from "@reloop/db/client";
import { emailLog, mailbox } from "@reloop/db/schema";
import { and, eq } from "drizzle-orm";

export async function getSentMessagesController(
	organizationId: string,
	mailboxId?: string,
) {
	const conditions = [eq(emailLog.organizationId, organizationId)];

	if (mailboxId) {
		const mbx = await db.query.mailbox.findFirst({
			where: and(
				eq(mailbox.id, mailboxId),
				eq(mailbox.organizationId, organizationId),
			),
		});
		if (mbx) {
			conditions.push(eq(emailLog.fromEmail, mbx.email));
		} else {
			// If mailbox ID is specified but not found, return empty list
			return [];
		}
	}

	const whereClause = and(...conditions);

	const sentEmails = await db.query.emailLog.findMany({
		where: whereClause,
		orderBy: (m, { desc }) => [desc(m.createdAt)],
		limit: 50,
	});

	return sentEmails;
}
