import { db } from "@reloop/db/client";
import { emailThread } from "@reloop/db/schema";
import {
	and,
	desc,
	eq,
	gt,
	ilike,
	isNotNull,
	isNull,
	lte,
	or,
} from "drizzle-orm";

export async function getThreadsController(
	organizationId: string,
	mailboxId?: string,
	limit = 50,
	offset = 0,
	folder?: string,
	q?: string,
) {
	const conditions = [eq(emailThread.organizationId, organizationId)];
	const now = new Date();

	if (mailboxId) {
		conditions.push(eq(emailThread.mailboxId, mailboxId));
	}

	switch (folder) {
		case "inbox":
			conditions.push(eq(emailThread.status, "active"));
			conditions.push(
				or(
					isNull(emailThread.snoozedUntil),
					lte(emailThread.snoozedUntil, now),
				)!,
			);
			break;
		case "archived":
		case "archive":
			conditions.push(eq(emailThread.status, "archived"));
			break;
		case "trash":
			conditions.push(eq(emailThread.status, "trash"));
			break;
		case "snoozed":
			conditions.push(isNotNull(emailThread.snoozedUntil));
			conditions.push(gt(emailThread.snoozedUntil, now));
			break;
		default:
			break;
	}

	if (q?.trim()) {
		const term = `%${q.trim()}%`;
		conditions.push(
			or(
				ilike(emailThread.subject, term),
				ilike(emailThread.lastMessagePreview, term),
			)!,
		);
	}

	const threads = await db.query.emailThread.findMany({
		where: and(...conditions),
		orderBy: [desc(emailThread.lastMessageAt)],
		limit: Math.min(limit, 200),
		offset,
	});

	return threads.map((t) => ({
		...t,
		participants: t.participants || [],
		isImportant: t.isImportant ?? false,
		snoozedUntil: t.snoozedUntil
			? t.snoozedUntil instanceof Date
				? t.snoozedUntil.toISOString()
				: t.snoozedUntil
			: null,
		deletedAt: t.deletedAt
			? t.deletedAt instanceof Date
				? t.deletedAt.toISOString()
				: t.deletedAt
			: null,
	}));
}
