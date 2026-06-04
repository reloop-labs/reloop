import { db } from "@reloop/db/client";
import { emailThread } from "@reloop/db/schema";
import { and, desc, eq } from "drizzle-orm";

export async function getThreadsController(
	organizationId: string,
	mailboxId?: string,
	limit = 50,
	offset = 0,
) {
	const conditions = [eq(emailThread.organizationId, organizationId)];

	if (mailboxId) {
		conditions.push(eq(emailThread.mailboxId, mailboxId));
	}

	const threads = await db.query.emailThread.findMany({
		where: and(...conditions),
		orderBy: [desc(emailThread.lastMessageAt)],
		limit,
		offset,
	});

	return threads.map((t) => ({
		...t,
		participants: t.participants || [],
	}));
}
