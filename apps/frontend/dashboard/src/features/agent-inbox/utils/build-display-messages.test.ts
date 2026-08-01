import { describe, expect, it } from "vitest";
import { buildDisplayMessages } from "./build-display-messages";

const listThread = {
	id: "inbound-1",
	threadId: "thread-1",
	direction: "inbound",
	from: { email: "alice@example.com", name: "Alice" },
	subject: "Hello",
	receivedAt: "2026-07-18T10:00:00.000Z",
	bodyText: "Original message",
};

describe("buildDisplayMessages", () => {
	it("does not paint the list preview while the full thread is loading", () => {
		const messages = buildDisplayMessages({
			thread: listThread,
			threadData: undefined,
			threadDataMatches: false,
			isLoadingThread: true,
		});
		expect(messages).toEqual([]);
	});

	it("renders the full conversation once the thread API matches", () => {
		const messages = buildDisplayMessages({
			thread: listThread,
			threadDataMatches: true,
			isLoadingThread: false,
			threadData: {
				messages: [
					{
						id: "inbound-1",
						direction: "inbound",
						messageAt: "2026-07-18T10:00:00.000Z",
						fromEmail: "alice@example.com",
					},
					{
						id: "outbound-1",
						direction: "outbound",
						messageAt: "2026-07-18T10:05:00.000Z",
						fromEmail: "agent@example.com",
					},
				],
			},
		});
		expect(messages.map((m) => m.id)).toEqual(["inbound-1", "outbound-1"]);
	});

	it("falls back to the list message when there is no threadId", () => {
		const messages = buildDisplayMessages({
			thread: { ...listThread, threadId: undefined },
			threadData: undefined,
			threadDataMatches: false,
			isLoadingThread: false,
			mailboxEmail: "agent@example.com",
		});
		expect(messages).toHaveLength(1);
		expect(messages[0].id).toBe("inbound-1");
		expect(messages[0].email.textBody).toBe("Original message");
	});

	it("falls back to the list message after the thread fetch fails to match", () => {
		const messages = buildDisplayMessages({
			thread: listThread,
			threadData: undefined,
			threadDataMatches: false,
			isLoadingThread: false,
		});
		expect(messages).toHaveLength(1);
		expect(messages[0].id).toBe("inbound-1");
	});

	it("keeps optimistic replies while waiting for the full thread", () => {
		const messages = buildDisplayMessages({
			thread: listThread,
			threadData: undefined,
			threadDataMatches: false,
			isLoadingThread: true,
			optimisticReplies: [
				{
					id: "opt-1",
					direction: "outbound",
					messageAt: "2026-07-18T10:06:00.000Z",
				},
			],
		});
		expect(messages.map((m) => m.id)).toEqual(["opt-1"]);
	});
});
