import { describe, expect, test } from "bun:test";
import type { InboxMessage, InboxThreadDetail } from "../src/reloop/types";
import { MAX_BODY_CHARS } from "../src/tools/inbox/schemas";
import { createHttpHandler } from "../src/transports/http";
import {
	connectHttpClient,
	mockReloop,
	type RecordedCall,
	type Route,
	readProperty,
	silentLogger,
	structuredContent,
	testConfig,
} from "./helpers";

function messageFixture(over: Partial<InboxMessage> = {}): InboxMessage {
	return {
		id: "msg_1",
		mailboxId: "mbx_1",
		fromEmail: "billing@stripe.com",
		fromName: "Stripe",
		toEmails: ["me@acme.dev"],
		ccEmails: null,
		replyTo: null,
		subject: "Your receipt",
		textBody: "Thanks for your payment.",
		htmlBody: "<p>Thanks for your payment.</p>",
		snippet: "Thanks for your payment.",
		size: 1200,
		status: "received",
		isRead: false,
		isStarred: false,
		isSpam: false,
		spamScore: 0.1,
		threadId: "thr_1",
		date: "2026-10-13T09:00:00.000Z",
		createdAt: "2026-10-13T09:00:01.000Z",
		attachments: [
			{
				id: "att_1",
				filename: "receipt.pdf",
				contentType: "application/pdf",
				size: 2048,
			},
		],
		...over,
	};
}

async function call(routes: Route[], name: string, args: object) {
	const mock = mockReloop(routes);
	const handler = createHttpHandler({
		config: testConfig(),
		logger: silentLogger(),
		fetch: mock.fetch,
	});
	const { client, close } = await connectHttpClient(handler);
	const result = await client.callTool({ name, arguments: { ...args } });
	await close();
	await handler.close();
	return { calls: mock.calls, result };
}

function only(calls: RecordedCall[]): RecordedCall {
	expect(calls).toHaveLength(1);
	const first = calls[0];
	if (first === undefined) throw new Error("expected one upstream call");
	return first;
}

describe("list_mailboxes", () => {
	test("lists the organization's inbox addresses", async () => {
		const { calls, result } = await call(
			[
				{
					method: "GET",
					path: "/api/inbox/v1/mailboxes/list",
					body: [
						{
							id: "mbx_1",
							email: "support@acme.dev",
							quota: "1GB",
							status: "active",
							displayName: "Acme Support",
							createdAt: "2026-10-01T00:00:00.000Z",
						},
					],
				},
			],
			"list_mailboxes",
			{},
		);
		expect(only(calls).method).toBe("GET");
		expect(readProperty(structuredContent(result), "mailboxes")).toEqual([
			{
				id: "mbx_1",
				email: "support@acme.dev",
				displayName: "Acme Support",
				status: "active",
				quota: "1GB",
				createdAt: "2026-10-01T00:00:00.000Z",
			},
		]);
	});
});

describe("list_inbox_messages", () => {
	test("forwards filters and returns previews without bodies", async () => {
		const { calls, result } = await call(
			[
				{
					method: "GET",
					path: "/api/inbox/v1/messages",
					body: [messageFixture()],
				},
			],
			"list_inbox_messages",
			{ mailboxId: "mbx_1", search: "stripe", spam: false, limit: 1 },
		);
		expect(only(calls).query).toEqual({
			mailboxId: "mbx_1",
			q: "stripe",
			isSpam: "false",
			limit: "1",
			offset: "0",
		});
		const data = structuredContent(result);
		const messages = readProperty(data, "messages");
		if (!Array.isArray(messages)) throw new Error("expected messages");
		expect(messages[0]).toEqual({
			id: "msg_1",
			mailboxId: "mbx_1",
			threadId: "thr_1",
			from: "billing@stripe.com",
			fromName: "Stripe",
			to: ["me@acme.dev"],
			subject: "Your receipt",
			snippet: "Thanks for your payment.",
			isRead: false,
			isStarred: false,
			isSpam: false,
			attachmentCount: 1,
			receivedAt: "2026-10-13T09:00:00.000Z",
		});
		expect(readProperty(readProperty(data, "pagination"), "hasMore")).toBe(
			true,
		);
	});
});

describe("get_inbox_message", () => {
	test("prefers the text body and caps long bodies", async () => {
		const long = "x".repeat(MAX_BODY_CHARS + 10);
		const { result } = await call(
			[
				{
					method: "GET",
					path: "/api/inbox/v1/messages/msg_1",
					body: messageFixture({ textBody: long }),
				},
			],
			"get_inbox_message",
			{ id: "msg_1" },
		);
		const data = structuredContent(result);
		expect(String(readProperty(data, "text"))).toHaveLength(MAX_BODY_CHARS);
		expect(readProperty(data, "html")).toBeNull();
		expect(readProperty(data, "bodyTruncated")).toBe(true);
		expect(readProperty(data, "attachments")).toEqual([
			{
				id: "att_1",
				filename: "receipt.pdf",
				contentType: "application/pdf",
				size: 2048,
			},
		]);
	});

	test("falls back to html when there is no text body", async () => {
		const { result } = await call(
			[
				{
					method: "GET",
					path: "/api/inbox/v1/messages/msg_1",
					body: messageFixture({ textBody: null }),
				},
			],
			"get_inbox_message",
			{ id: "msg_1" },
		);
		expect(readProperty(structuredContent(result), "html")).toBe(
			"<p>Thanks for your payment.</p>",
		);
	});

	test("maps a missing message to message_not_found", async () => {
		const { result } = await call(
			[
				{
					method: "GET",
					path: "/api/inbox/v1/messages/msg_x",
					status: 404,
					body: { message: "Message not found" },
				},
			],
			"get_inbox_message",
			{ id: "msg_x" },
		);
		expect(result.isError).toBe(true);
		expect(JSON.stringify(result.content)).toContain("message_not_found");
	});
});

describe("update_inbox_message", () => {
	test("sends only the flags that change", async () => {
		const { calls } = await call(
			[
				{
					method: "PATCH",
					path: "/api/inbox/v1/messages/msg_1",
					body: { success: true },
				},
			],
			"update_inbox_message",
			{ id: "msg_1", read: true },
		);
		expect(only(calls).body).toEqual({ isRead: true });
	});

	test("rejects a call that changes nothing", async () => {
		const { calls, result } = await call([], "update_inbox_message", {
			id: "msg_1",
		});
		expect(calls).toHaveLength(0);
		expect(result.isError).toBe(true);
	});
});

describe("reply_to_inbox_message", () => {
	test("uses reply-all when asked and maps attachment fields", async () => {
		const { calls, result } = await call(
			[
				{
					method: "POST",
					path: "/api/inbox/v1/messages/msg_1/reply-all",
					body: {
						success: true,
						messageId: "<abc@acme.dev>",
						status: "sent",
						timestamp: "2026-10-13T10:00:00.000Z",
						id: "log_1",
					},
				},
			],
			"reply_to_inbox_message",
			{
				id: "msg_1",
				text: "Thanks!",
				replyAll: true,
				attachments: [
					{
						filename: "notes.txt",
						content: "aGk=",
						contentType: "text/plain",
					},
				],
			},
		);
		expect(only(calls).body).toEqual({
			text: "Thanks!",
			attachments: [
				{ filename: "notes.txt", content: "aGk=", content_type: "text/plain" },
			],
		});
		expect(structuredContent(result)).toEqual({
			id: "log_1",
			messageId: "<abc@acme.dev>",
			status: "sent",
			sendAt: null,
		});
	});

	test("needs a body", async () => {
		const { calls, result } = await call([], "reply_to_inbox_message", {
			id: "msg_1",
		});
		expect(calls).toHaveLength(0);
		expect(result.isError).toBe(true);
	});
});

describe("send_mailbox_email", () => {
	test("reports a pending send that can be cancelled", async () => {
		const { calls, result } = await call(
			[
				{
					method: "POST",
					path: "/api/inbox/v1/messages/send",
					body: {
						success: true,
						pending: true,
						id: "pnd_1",
						sendAt: "2026-10-13T10:00:30.000Z",
						messageId: "<p@acme.dev>",
					},
				},
			],
			"send_mailbox_email",
			{
				mailboxId: "mbx_1",
				to: "jane@example.com",
				subject: "Hello",
				text: "Hi Jane",
				undoWindowSeconds: 30,
			},
		);
		expect(only(calls).body).toEqual({
			mailboxId: "mbx_1",
			to: "jane@example.com",
			subject: "Hello",
			text: "Hi Jane",
			undoWindowSeconds: 30,
		});
		expect(structuredContent(result)).toEqual({
			id: "pnd_1",
			messageId: "<p@acme.dev>",
			status: "pending",
			sendAt: "2026-10-13T10:00:30.000Z",
		});
	});
});

describe("forward_inbox_message", () => {
	test("posts to the forward endpoint", async () => {
		const { calls } = await call(
			[
				{
					method: "POST",
					path: "/api/inbox/v1/messages/msg_1/forward",
					body: {
						success: true,
						messageId: "<f@acme.dev>",
						status: "sent",
						timestamp: "2026-10-13T10:00:00.000Z",
						id: "log_2",
					},
				},
			],
			"forward_inbox_message",
			{ id: "msg_1", to: ["ops@acme.dev"], text: "FYI" },
		);
		expect(only(calls).body).toEqual({ to: ["ops@acme.dev"], text: "FYI" });
	});
});

describe("threads", () => {
	const thread: InboxThreadDetail = {
		id: "thr_1",
		mailboxId: "mbx_1",
		subject: "Your receipt",
		lastMessagePreview: "Thanks!",
		lastMessageAt: "2026-10-13T10:00:00.000Z",
		status: "active",
		messageCount: 2,
		participants: ["billing@stripe.com", "me@acme.dev"],
		isRead: true,
		isStarred: false,
		labels: [{ id: "lbl_1", name: "Finance", color: "#000" }],
		createdAt: "2026-10-13T09:00:00.000Z",
		updatedAt: "2026-10-13T10:00:00.000Z",
		messages: [
			{
				id: "tm_1",
				direction: "inbound",
				inboundEmailId: "msg_1",
				fromEmail: "billing@stripe.com",
				fromName: "Stripe",
				subject: "Your receipt",
				preview: "Thanks for your payment.",
				messageAt: "2026-10-13T09:00:00.000Z",
				email: {
					id: "msg_1",
					toEmails: ["me@acme.dev"],
					ccEmails: null,
					textBody: "Thanks for your payment.",
					htmlBody: null,
					isRead: true,
					attachments: [],
				},
			},
			{
				id: "tm_2",
				direction: "outbound",
				emailLogId: "log_1",
				fromEmail: "me@acme.dev",
				subject: "Re: Your receipt",
				preview: "Thanks!",
				messageAt: "2026-10-13T10:00:00.000Z",
				email: null,
			},
		],
	};

	test("get_inbox_thread returns messages with reply ids", async () => {
		const { result } = await call(
			[{ method: "GET", path: "/api/inbox/v1/threads/thr_1", body: thread }],
			"get_inbox_thread",
			{ id: "thr_1" },
		);
		const data = structuredContent(result);
		expect(readProperty(data, "labels")).toEqual(["Finance"]);
		const messages = readProperty(data, "messages");
		if (!Array.isArray(messages)) throw new Error("expected messages");
		expect(messages[0]).toMatchObject({
			direction: "inbound",
			messageId: "msg_1",
			text: "Thanks for your payment.",
		});
		expect(messages[1]).toMatchObject({
			direction: "outbound",
			messageId: null,
			text: "Thanks!",
		});
	});

	test("list_inbox_threads forwards folder and filter", async () => {
		const { calls } = await call(
			[{ method: "GET", path: "/api/inbox/v1/threads", body: [thread] }],
			"list_inbox_threads",
			{ folder: "archive", filter: "alerts" },
		);
		expect(only(calls).query).toEqual({
			folder: "archive",
			filter: "alerts",
			limit: "25",
			offset: "0",
		});
	});

	test("move_inbox_thread posts the action", async () => {
		const { calls } = await call(
			[
				{
					method: "POST",
					path: "/api/inbox/v1/threads/thr_1/trash",
					body: { success: true },
				},
			],
			"move_inbox_thread",
			{ id: "thr_1", action: "trash" },
		);
		expect(only(calls).method).toBe("POST");
	});

	test("update_inbox_thread maps closed to the thread status", async () => {
		const { calls } = await call(
			[
				{
					method: "PATCH",
					path: "/api/inbox/v1/threads/thr_1",
					body: { success: true },
				},
			],
			"update_inbox_thread",
			{ id: "thr_1", closed: true, starred: true },
		);
		expect(only(calls).body).toEqual({ isStarred: true, status: "closed" });
	});

	test("delete_inbox_thread deletes", async () => {
		const { calls, result } = await call(
			[
				{
					method: "DELETE",
					path: "/api/inbox/v1/threads/thr_1",
					body: { success: true },
				},
			],
			"delete_inbox_thread",
			{ id: "thr_1" },
		);
		expect(only(calls).method).toBe("DELETE");
		expect(structuredContent(result)).toEqual({ deleted: true, id: "thr_1" });
	});
});
