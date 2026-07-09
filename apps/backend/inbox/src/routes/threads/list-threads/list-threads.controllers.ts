import { db } from "@reloop/db/client";
import {
	emailLabel,
	emailThread,
	threadLabel,
} from "@reloop/db/schema";
import { and, desc, eq, exists, ilike, inArray, or } from "drizzle-orm";

export type ThreadListFilter = "primary" | "alerts" | "person" | "tag";

export async function getThreadsController(
	organizationId: string,
	mailboxId?: string,
	limit = 50,
	offset = 0,
	folder?: string,
	q?: string,
	isPinned?: boolean,
	filter?: ThreadListFilter,
) {
	const conditions = [eq(emailThread.organizationId, organizationId)];

	if (mailboxId) {
		conditions.push(eq(emailThread.mailboxId, mailboxId));
	}

	switch (folder) {
		case "inbox":
			conditions.push(eq(emailThread.status, "active"));
			break;
		case "archived":
		case "archive":
			conditions.push(eq(emailThread.status, "archived"));
			break;
		case "trash":
			conditions.push(eq(emailThread.status, "trash"));
			break;
		default:
			break;
	}

	if (isPinned !== undefined) {
		conditions.push(eq(emailThread.isPinned, isPinned));
	}

	if (filter === "alerts") {
		conditions.push(eq(emailThread.isImportant, true));
	}

	if (filter === "tag") {
		conditions.push(
			exists(
				db
					.select({ id: threadLabel.threadId })
					.from(threadLabel)
					.where(eq(threadLabel.threadId, emailThread.id)),
			),
		);
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
		orderBy: [
			desc(emailThread.isPinned),
			desc(emailThread.pinnedAt),
			desc(emailThread.lastMessageAt),
		],
		limit: Math.min(limit, 200),
		offset,
	});

	const threadIds = threads.map((t) => t.id);
	const labelRows =
		threadIds.length === 0
			? []
			: await db
					.select({
						threadId: threadLabel.threadId,
						id: emailLabel.id,
						name: emailLabel.name,
						color: emailLabel.color,
					})
					.from(threadLabel)
					.innerJoin(emailLabel, eq(threadLabel.labelId, emailLabel.id))
					.where(inArray(threadLabel.threadId, threadIds));

	const labelsByThread = new Map<
		string,
		{ id: string; name: string; color: string }[]
	>();
	for (const row of labelRows) {
		const list = labelsByThread.get(row.threadId) ?? [];
		list.push({ id: row.id, name: row.name, color: row.color });
		labelsByThread.set(row.threadId, list);
	}

	return threads.map((t) => ({
		...t,
		participants: t.participants || [],
		isImportant: t.isImportant ?? false,
		isPinned: t.isPinned ?? false,
		pinnedAt: t.pinnedAt
			? t.pinnedAt instanceof Date
				? t.pinnedAt.toISOString()
				: t.pinnedAt
			: null,
		labels: labelsByThread.get(t.id) ?? [],
		deletedAt: t.deletedAt
			? t.deletedAt instanceof Date
				? t.deletedAt.toISOString()
				: t.deletedAt
			: null,
	}));
}
