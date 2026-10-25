import { db } from "@reloop/db/client";
import { mailbox } from "@reloop/db/schema";
import { and, eq, inArray } from "drizzle-orm";

export async function getMailboxesController(
	organizationId: string,
	mailboxIds?: string[],
) {
	if (mailboxIds && mailboxIds.length === 0) return [];
	const mailboxes = await db.query.mailbox.findMany({
		where: and(
			eq(mailbox.organizationId, organizationId),
			mailboxIds ? inArray(mailbox.id, mailboxIds) : undefined,
		),
		orderBy: (m, { desc }) => [desc(m.createdAt)],
	});

	return mailboxes.map((m) => ({
		id: m.id,
		email: m.email,
		quota: m.quota,
		status: m.status,
		displayName: m.displayName,
		createdAt: m.createdAt,
	}));
}
