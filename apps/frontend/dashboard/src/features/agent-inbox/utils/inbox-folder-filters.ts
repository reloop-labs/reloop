import type { InboundThread } from "../types";

/** Threads shown in the main inbox folder (matches page filter). */
export const filterInboxThreads = (
	threads: InboundThread[],
	mailboxId: string,
): InboundThread[] => {
	return threads.filter(
		(t) =>
			t.mailboxId === mailboxId &&
			t.direction === "inbound" &&
			t.status !== "blocked",
	);
};
