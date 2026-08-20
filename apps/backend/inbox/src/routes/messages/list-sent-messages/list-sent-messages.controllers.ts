import { db } from "@reloop/db/client";
import {
	emailLog,
	emailThread,
	mailbox,
	threadMessage,
} from "@reloop/db/schema";
import { and, eq, inArray, or, sql } from "drizzle-orm";

function bareEmail(value: string): string {
	const match = value.match(/<([^>]+)>/);
	return (match?.[1] ?? value).trim().toLowerCase();
}

export async function getSentMessagesController(
	organizationId: string,
	mailboxId?: string,
	q?: string,
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

	const term = q?.trim();
	if (term) {
		const like = `%${term}%`;
		conditions.push(
			or(
				sql`cast(${emailLog.subject} as text) ilike ${like}`,
				sql`cast(${emailLog.textBody} as text) ilike ${like}`,
				sql`cast(${emailLog.fromEmail} as text) ilike ${like}`,
				sql`cast(${emailLog.toEmails} as text) ilike ${like}`,
			)!,
		);
	}

	const whereClause = and(...conditions);

	const sentEmails = await db.query.emailLog.findMany({
		where: whereClause,
		orderBy: (m, { desc }) => [desc(m.createdAt)],
		limit: 50,
	});

	if (sentEmails.length === 0) return [];

	const logIds = sentEmails.map((e) => e.id);
	const links = await db.query.threadMessage.findMany({
		where: inArray(threadMessage.emailLogId, logIds),
		columns: { emailLogId: true, threadId: true },
	});
	const threadIdByLog = new Map(
		links
			.filter((l): l is typeof l & { emailLogId: string } => !!l.emailLogId)
			.map((l) => [l.emailLogId, l.threadId]),
	);
	const threadIds = [...new Set(threadIdByLog.values())];
	const threads =
		threadIds.length > 0
			? await db.query.emailThread.findMany({
					where: and(
						eq(emailThread.organizationId, organizationId),
						inArray(emailThread.id, threadIds),
					),
					columns: { id: true, isStarred: true },
				})
			: [];
	const starredByThread = new Map(threads.map((t) => [t.id, t.isStarred]));

	return sentEmails.map((email) => {
		const threadId = threadIdByLog.get(email.id);
		return {
			...email,
			threadId: threadId ?? null,
			isStarred: threadId ? Boolean(starredByThread.get(threadId)) : false,
		};
	});
}
