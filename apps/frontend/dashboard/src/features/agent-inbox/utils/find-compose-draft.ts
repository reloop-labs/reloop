import type { ComposeDraft, ComposeDraftKind } from "../types";

/** First draft matching mailbox + thread + kind (newest-first lists). */
export function findComposeDraft(
	drafts: ComposeDraft[],
	input: {
		mailboxId: string;
		threadId: string;
		kind: ComposeDraftKind;
	},
): ComposeDraft | null {
	return (
		drafts.find(
			(d) =>
				d.mailboxId === input.mailboxId &&
				d.threadId === input.threadId &&
				d.kind === input.kind,
		) ?? null
	);
}
