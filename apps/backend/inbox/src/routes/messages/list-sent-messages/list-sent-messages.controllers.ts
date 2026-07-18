import { db } from "@reloop/db/client";
import { emailLog, mailbox } from "@reloop/db/schema";
import { and, eq, or, sql } from "drizzle-orm";

function bareEmail(value: string): string {
	const match = value.match(/<([^>]+)>/);
	return (match?.[1] ?? value).trim().toLowerCase();
}

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
		if (!mbx) {
			return [];
		}

		const email = bareEmail(mbx.email);
		// Match bare address or "Name <address>" stored in fromEmail.
		const mailboxMatch = or(
			eq(emailLog.fromEmail, mbx.email),
			eq(emailLog.fromEmail, email),
			sql`lower(${emailLog.fromEmail}) = ${email}`,
			sql`lower(${emailLog.fromEmail}) like ${`%<${email}>%`}`,
		);
		if (mailboxMatch) {
			conditions.push(mailboxMatch);
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
