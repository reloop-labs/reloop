import { db } from "@reloop/db/client";
import { mailbox } from "@reloop/db/schema";
import { eq } from "drizzle-orm";

export async function getMailboxesController(organizationId: string) {
	const mailboxes = await db.query.mailbox.findMany({
		where: eq(mailbox.organizationId, organizationId),
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
