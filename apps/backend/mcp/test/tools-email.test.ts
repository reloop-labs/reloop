import { describe, expect, test } from "bun:test";
import { createHttpHandler } from "../src/transports/http";
import {
	API_KEY,
	capturingLogger,
	connectHttpClient,
	errorJson,
	firstText,
	mockReloop,
	type RecordedCall,
	type Route,
	readProperty,
	silentLogger,
	structuredContent,
	testConfig,
} from "./helpers";

const SEND_PATH = "/api/mail/v1/send";

const SENT = {
	success: true,
	messageId: "msg_abc",
	status: "sent",
	timestamp: "2026-02-01T10:00:00.000Z",
	id: "eml_123",
};

function harness(routes: Route[], timeoutMs?: number) {
	const mock = mockReloop(routes);
	const handler = createHttpHandler({
		config: testConfig(timeoutMs === undefined ? {} : { timeoutMs }),
		logger: silentLogger(),
		fetch: mock.fetch,
	});
	return { calls: mock.calls, handler };
}

function upstream(calls: RecordedCall[]): RecordedCall {
	const call = calls.find((entry) => entry.path === SEND_PATH);
	if (call === undefined) {
		throw new Error(`no upstream call to ${SEND_PATH}`);
	}
	return call;
}

async function callSend(
	handler: ReturnType<typeof harness>["handler"],
	args: Record<string, unknown>,
) {
	const { client, close } = await connectHttpClient(handler);
	const result = await client.callTool({ name: "email_send", arguments: args });
	await close();
	await handler.close();
	return result;
}

function errorField(result: unknown, key: string): unknown {
	return readProperty(errorJson(result), key);
}

describe("email_send", () => {
	test("forwards the full payload with API field names", async () => {
		const { calls, handler } = harness([
			{ method: "POST", path: SEND_PATH, body: SENT },
		]);
		const result = await callSend(handler, {
			from: "Jane Doe <jane@example.com>",
			to: ["luna@example.com", "sol@example.com"],
			subject: "Launch",
			html: "<p>Hi</p>",
			text: "Hi",
			cc: "cc@example.com",
			bcc: ["bcc@example.com"],
			replyTo: "replies@example.com",
			headers: { "X-Campaign": "launch" },
			tags: [{ name: "campaign", value: "launch" }],
			template: { id: "tpl_1", variables: { plan: "pro", seats: 4 } },
			scheduledAt: "2026-03-01T10:00:00.000Z",
			channelId: "chn_1",
		});
		expect(upstream(calls).body).toEqual({
			from: "Jane Doe <jane@example.com>",
			to: ["luna@example.com", "sol@example.com"],
			subject: "Launch",
			html: "<p>Hi</p>",
			text: "Hi",
			cc: "cc@example.com",
			bcc: ["bcc@example.com"],
			reply_to: "replies@example.com",
			headers: { "X-Campaign": "launch" },
			tags: [{ name: "campaign", value: "launch" }],
			template: { id: "tpl_1", variables: { plan: "pro", seats: 4 } },
			scheduled_at: "2026-03-01T10:00:00.000Z",
			channel_id: "chn_1",
		});
		expect(structuredContent(result)).toEqual({
			id: "eml_123",
			messageId: "msg_abc",
			status: "sent",
			timestamp: "2026-02-01T10:00:00.000Z",
		});
	});

	test("forwards a bare string recipient as a string", async () => {
		const { calls, handler } = harness([
			{ method: "POST", path: SEND_PATH, body: SENT },
		]);
		await callSend(handler, {
			from: "jane@example.com",
			to: "luna@example.com",
			subject: "Hello",
			text: "Hi",
		});
		expect(readProperty(upstream(calls).body, "to")).toBe("luna@example.com");
	});

	test("never logs the API key", async () => {
		const mock = mockReloop([{ method: "POST", path: SEND_PATH, body: SENT }]);
		const captured = capturingLogger();
		const handler = createHttpHandler({
			config: testConfig(),
			logger: captured.logger,
			fetch: mock.fetch,
		});
		const { client, close } = await connectHttpClient(handler);
		await client.callTool({
			name: "email_send",
			arguments: {
				from: "jane@example.com",
				to: "luna@example.com",
				subject: "Hello",
				text: "Hi",
			},
		});
		await close();
		await handler.close();
		expect(captured.lines.length).toBeGreaterThan(0);
		for (const line of captured.lines) {
			expect(line).not.toContain(API_KEY);
		}
	});
});

describe("email_send validation", () => {
	const base = {
		from: "jane@example.com",
		to: "luna@example.com",
		subject: "Hello",
		text: "Hi",
	};

	test("rejects a message with no text, html, or template", async () => {
		const { handler } = harness([]);
		const result = await callSend(handler, {
			from: base.from,
			to: base.to,
			subject: base.subject,
		});
		expect(result.isError).toBe(true);
		expect(firstText(result)).toContain("text, html, or a template");
	});

	test("rejects more than 50 recipients", async () => {
		const { handler } = harness([]);
		const result = await callSend(handler, {
			...base,
			to: Array.from({ length: 51 }, (_, index) => `user${index}@example.com`),
		});
		expect(result.isError).toBe(true);
	});

	test("rejects a display name containing a newline", async () => {
		const { handler } = harness([]);
		const result = await callSend(handler, {
			...base,
			from: "Jane\nDoe <jane@example.com>",
		});
		expect(result.isError).toBe(true);
	});

	test("rejects a header value containing CRLF", async () => {
		const { handler } = harness([]);
		const result = await callSend(handler, {
			...base,
			headers: { "X-Campaign": "launch\r\nBcc: leak@example.com" },
		});
		expect(result.isError).toBe(true);
	});

	test("rejects unicode line breaks in header values, subject, and sender", async () => {
		const { handler } = harness([]);
		const nel = await callSend(handler, {
			...base,
			headers: { "X-Campaign": "launch\u0085Bcc: leak@example.com" },
		});
		expect(nel.isError).toBe(true);
		const subject = await callSend(harness([]).handler, {
			...base,
			subject: "Hello\nBcc: leak@example.com",
		});
		expect(subject.isError).toBe(true);
		expect(firstText(subject)).toContain("single line");
		const sender = await callSend(harness([]).handler, {
			...base,
			from: "Jane\u2028Doe <jane@example.com>",
		});
		expect(sender.isError).toBe(true);
	});

	test("rejects a reserved header name regardless of case", async () => {
		const { handler } = harness([]);
		const result = await callSend(handler, {
			...base,
			headers: { Bcc: "leak@example.com" },
		});
		expect(result.isError).toBe(true);
		expect(firstText(result)).toContain("standard envelope headers");
	});

	test("rejects a reserved template variable key", async () => {
		const { handler } = harness([]);
		const result = await callSend(handler, {
			...base,
			template: { id: "tpl_1", variables: { EMAIL: "luna@example.com" } },
		});
		expect(result.isError).toBe(true);
	});

	test("rejects a scheduledAt that is not ISO 8601", async () => {
		const { handler } = harness([]);
		const result = await callSend(handler, {
			...base,
			scheduledAt: "next tuesday",
		});
		expect(result.isError).toBe(true);
	});
});

describe("email_send errors", () => {
	const base = {
		from: "jane@example.com",
		to: "luna@example.com",
		subject: "Hello",
		text: "Hi",
	};

	test("maps a DNS failure to validation_error and keeps why", async () => {
		const { handler } = harness([
			{
				method: "POST",
				path: SEND_PATH,
				status: 400,
				body: {
					message: "DNS health check failed",
					why: "The SPF record for example.com is missing",
				},
			},
		]);
		const result = await callSend(handler, base);
		expect(errorField(result, "code")).toBe("validation_error");
		expect(errorField(result, "why")).toBe(
			"The SPF record for example.com is missing",
		);
	});

	test("maps 402 to quota_exceeded", async () => {
		const { handler } = harness([
			{
				method: "POST",
				path: SEND_PATH,
				status: 402,
				body: { message: "Email quota exceeded" },
			},
		]);
		expect(errorField(await callSend(handler, base), "code")).toBe(
			"quota_exceeded",
		);
	});

	test("maps a missing sending domain to not_found", async () => {
		const { handler } = harness([
			{
				method: "POST",
				path: SEND_PATH,
				status: 404,
				body: { message: "Domain not found" },
			},
		]);
		expect(errorField(await callSend(handler, base), "code")).toBe("not_found");
	});

	test("maps 401 to unauthorized", async () => {
		const { handler } = harness([
			{
				method: "POST",
				path: SEND_PATH,
				status: 401,
				body: { message: "Invalid API key" },
			},
		]);
		expect(errorField(await callSend(handler, base), "code")).toBe(
			"unauthorized",
		);
	});

	test("maps 429 to a retryable rate_limited with retryAfterSeconds", async () => {
		const { handler } = harness([
			{
				method: "POST",
				path: SEND_PATH,
				status: 429,
				body: { message: "Too many requests" },
				headers: { "retry-after": "42" },
			},
		]);
		const result = await callSend(handler, base);
		expect(errorField(result, "code")).toBe("rate_limited");
		expect(errorField(result, "retryable")).toBe(true);
		expect(errorField(result, "retryAfterSeconds")).toBe(42);
	});

	test("maps 500 to a non-retryable upstream_error", async () => {
		const { handler } = harness([
			{
				method: "POST",
				path: SEND_PATH,
				status: 500,
				body: { message: "Failed to transmit email" },
			},
		]);
		const result = await callSend(handler, base);
		expect(errorField(result, "code")).toBe("upstream_error");
		expect(errorField(result, "retryable")).toBe(false);
	});

	test("maps a connection failure to a non-retryable network_error", async () => {
		const { handler } = harness([
			{ method: "POST", path: SEND_PATH, error: "ECONNREFUSED" },
		]);
		const result = await callSend(handler, base);
		expect(errorField(result, "code")).toBe("network_error");
		expect(errorField(result, "retryable")).toBe(false);
		expect(String(errorField(result, "fix"))).toContain("may not have reached");
	});

	test("maps a timeout to a non-retryable timeout", async () => {
		const { handler } = harness(
			[{ method: "POST", path: SEND_PATH, body: SENT, delayMs: 200 }],
			20,
		);
		const result = await callSend(handler, base);
		expect(errorField(result, "code")).toBe("timeout");
		expect(errorField(result, "retryable")).toBe(false);
		expect(String(errorField(result, "fix"))).toContain("may have reached");
	});
});

describe("tool registry", () => {
	test("lists email_send last with its annotations", async () => {
		const { handler } = harness([]);
		const { client, close } = await connectHttpClient(handler);
		const listed = await client.listTools();
		expect(listed.tools).toHaveLength(6);
		expect(listed.tools[5]?.name).toBe("email_send");
		expect(listed.tools[5]?.annotations).toMatchObject({
			readOnlyHint: false,
			destructiveHint: true,
			idempotentHint: false,
			openWorldHint: true,
		});
		await close();
		await handler.close();
	});
});

describe("email_send hardening", () => {
	const base = {
		from: "jane@example.com",
		to: "luna@example.com",
		subject: "Hello",
		text: "Hi",
	};

	test("rejects address-list separators inside a display name", async () => {
		for (const to of [
			"a@evil.com, Jane <c@d.co>",
			"evil@attacker.com,<c@d.co>",
			"Jane; Bob <c@d.co>",
		]) {
			const result = await callSend(harness([]).handler, { ...base, to });
			expect(result.isError).toBe(true);
		}
	});

	test("rejects a template id that is not a single path segment", async () => {
		const result = await callSend(harness([]).handler, {
			...base,
			template: { id: "../secrets" },
		});
		expect(result.isError).toBe(true);
	});

	test("rejects more than 100 headers", async () => {
		const headers: Record<string, string> = {};
		for (let index = 0; index <= 100; index += 1) {
			headers[`X-Custom-${index}`] = "v";
		}
		const result = await callSend(harness([]).handler, { ...base, headers });
		expect(result.isError).toBe(true);
	});
});
