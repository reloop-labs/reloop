import { describe, expect, test } from "bun:test";
import { InboxErrors } from "../src/lib/errors";
import { decideInboxSlot } from "../src/lib/inbox-quota";

describe("decideInboxSlot", () => {
	test("free plan cap of 1 blocks the second inbox", () => {
		let used = 0;
		let accepted = 0;
		let denied = 0;

		for (let i = 0; i < 50; i++) {
			const decision = decideInboxSlot({ used, limit: 1 });
			if (decision.ok) {
				used += 1;
				accepted += 1;
			} else {
				denied += 1;
			}
		}

		expect(accepted).toBe(1);
		expect(denied).toBe(49);
		expect(used).toBe(1);
	});

	test("a paid cap of 5 allows five inboxes then blocks", () => {
		let used = 0;
		let accepted = 0;

		for (let i = 0; i < 20; i++) {
			const decision = decideInboxSlot({ used, limit: 5 });
			if (decision.ok) {
				used += 1;
				accepted += 1;
			}
		}

		expect(accepted).toBe(5);
		expect(used).toBe(5);
	});
});

describe("InboxErrors.inboxLimitReached", () => {
	test("returns 402 with used vs plan cap", () => {
		const err = InboxErrors.inboxLimitReached({
			used: 1,
			limit: 1,
		}) as Error & { status?: number; why?: string; fix?: string };

		expect(err.status).toBe(402);
		expect(err.message).toBe("Inbox limit reached");
		expect(err.why).toContain("1 agent inbox");
		expect(err.why).toContain("already have 1");
		expect(err.fix).toContain("upgrade");
	});
});
