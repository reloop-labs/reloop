import type { InboundThread } from "../types";

/** Group messages by threadId, keeping the latest message per conversation as the row. */
export function groupThreadsByConversation(
	threads: InboundThread[],
): InboundThread[] {
	const groups = new Map<string, InboundThread>();
	const ungrouped: InboundThread[] = [];

	for (const thread of threads) {
		if (thread.threadId) {
			const existing = groups.get(thread.threadId);
			if (
				!existing ||
				new Date(thread.receivedAt).getTime() >
					new Date(existing.receivedAt).getTime()
			) {
				groups.set(thread.threadId, {
					...thread,
					id: thread.threadId,
					messageId: thread.id,
				});
			}
		} else {
			ungrouped.push({ ...thread, messageId: thread.id });
		}
	}

	return [...groups.values(), ...ungrouped].sort(
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
