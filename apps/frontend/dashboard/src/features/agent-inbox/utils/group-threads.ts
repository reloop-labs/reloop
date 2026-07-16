import type { InboundThread } from "../types";

/** Group messages by threadId, keeping the latest message per conversation as the row. */
export function groupThreadsByConversation(
	threads: InboundThread[],
): InboundThread[] {
	const groups = new Map<string, InboundThread>();
	const counts = new Map<string, number>();
	const ungrouped: InboundThread[] = [];

	for (const thread of threads) {
		if (thread.threadId) {
			counts.set(thread.threadId, (counts.get(thread.threadId) ?? 0) + 1);
			const existing = groups.get(thread.threadId);
			if (
				!existing ||
				new Date(thread.receivedAt).getTime() >
					new Date(existing.receivedAt).getTime()
			) {
				groups.set(thread.threadId, {
					...thread,
					id: thread.threadId,
					messageId: thread.messageId ?? thread.id,
				});
			} else {
				// Keep pin/important/labels from whichever row has them
				groups.set(thread.threadId, {
					...existing,
					isPinned: existing.isPinned || thread.isPinned,
					isImportant: existing.isImportant || thread.isImportant,
					labels:
						(existing.labels?.length ?? 0) > 0
							? existing.labels
							: thread.labels,
					messageCount: Math.max(
						existing.messageCount ?? 0,
						thread.messageCount ?? 0,
					),
				});
			}
		} else {
			ungrouped.push({ ...thread, messageId: thread.messageId ?? thread.id });
		}
	}

	const grouped = [...groups.entries()].map(([threadId, thread]) => ({
		...thread,
		messageCount: Math.max(thread.messageCount ?? 0, counts.get(threadId) ?? 1),
	}));

	return [...grouped, ...ungrouped].sort(
		(a, b) =>
			new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime(),
	);
}

export function findThreadByListId(
	threads: InboundThread[],
	listId: string,
): InboundThread | null {
	return (
		threads.find(
			(t) => t.id === listId || t.threadId === listId || t.messageId === listId,
		) ?? null
	);
}

export function applyInboxViewFilter(
	threads: InboundThread[],
	view: string,
): InboundThread[] {
	switch (view) {
		case "alerts":
			return threads.filter(
				(t) => t.status === "needs_approval" || t.isImportant,
			);
		case "person":
			return threads.filter(
				(t) => t.direction !== "outbound" && t.status !== "handled",
			);
		case "tag":
			return threads.filter((t) => (t.labels?.length ?? 0) > 0);
		case "primary":
		default:
			return threads;
	}
}

export function splitPinnedThreads(threads: InboundThread[]): {
	pinned: InboundThread[];
	rest: InboundThread[];
} {
	const pinned: InboundThread[] = [];
	const rest: InboundThread[] = [];
	for (const thread of threads) {
		if (thread.isPinned) pinned.push(thread);
		else rest.push(thread);
	}
	pinned.sort((a, b) => {
		const aAt = a.pinnedAt ? new Date(a.pinnedAt).getTime() : 0;
		const bAt = b.pinnedAt ? new Date(b.pinnedAt).getTime() : 0;
		if (bAt !== aAt) return bAt - aAt;
		return new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime();
	});
	return { pinned, rest };
}
