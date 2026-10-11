import { describe, expect, test } from "bun:test";
import type { EmailLog, Template } from "../src/reloop/types";
import { createHttpHandler } from "../src/transports/http";
import {
	connectHttpClient,
	errorJson,
	mockReloop,
	type RecordedCall,
	type Route,
	readProperty,
	silentLogger,
	structuredContent,
	testConfig,
} from "./helpers";

function emailLogFixture(over: Partial<EmailLog> = {}): EmailLog {
	return {
		id: "log_1",
		messageId: "<msg_1@send.example.com>",
		domainId: "dom_1",
		fromEmail: "hi@send.example.com",
		fromName: "Reloop",
		toEmails: ["luna@example.com"],
		ccEmails: null,
		bccEmails: null,
		replyTo: null,
		subject: "Welcome",
		textBody: "Hello",
		htmlBody: "<p>Hello</p>",
		status: "delivered",
		errorMessage: null,
		size: 1024,
		sentAt: "2026-01-01T00:00:01.000Z",
		deliveredAt: "2026-01-01T00:00:02.000Z",
		failedAt: null,
		createdAt: "2026-01-01T00:00:00.000Z",
		updatedAt: "2026-01-01T00:00:02.000Z",
		attachments: [
			{
				id: "att_1",
				filename: "a.pdf",
				contentType: "application/pdf",
				size: 10,
			},
		],
		events: [
			{
				id: "evt_1",
				type: "delivered",
				metadata: null,
				createdAt: "2026-01-01T00:00:02.000Z",
			},
		],
		source: "transactional",
		origin: null,
		...over,
	};
}

function templateFixture(over: Partial<Template> = {}): Template {
	return {
		id: "tpl_1",
		name: "Welcome",
		description: null,
		subject: "Welcome {{FIRST_NAME}}",
		fromEmail: "hi@send.example.com",
		replyTo: null,
		previewText: null,
		status: "published",
		variables: [{ name: "plan", type: "string", defaultValue: "free" }],
		currentVersion: 3,
		thumbnailUrl: null,
		createdAt: "2026-01-01T00:00:00.000Z",
		updatedAt: "2026-01-02T00:00:00.000Z",
		...over,
	};
}

function harness(routes: Route[]) {
	const mock = mockReloop(routes);
	const handler = createHttpHandler({
		config: testConfig(),
		logger: silentLogger(),
		fetch: mock.fetch,
	});
	return { calls: mock.calls, handler };
}

function onlyCall(calls: RecordedCall[]): RecordedCall {
	expect(calls).toHaveLength(1);
	const call = calls[0];
	if (call === undefined) {
		throw new Error("expected one upstream call");
	}
	return call;
}

async function call(routes: Route[], name: string, args: object) {
	const { calls, handler } = harness(routes);
	const { client, close } = await connectHttpClient(handler);
	const result = await client.callTool({ name, arguments: { ...args } });
	await close();
	await handler.close();
	return { calls, result };
}

describe("list_emails", () => {
	test("maps filters to the logs api and flattens entries", async () => {
		const { calls, result } = await call(
			[
				{
					method: "GET",
					path: "/api/logs/v1/emails",
					body: {
						object: "list",
						data: [
							{
								id: "log_1",
								subject: "Welcome",
								fromEmail: "hi@send.example.com",
								toEmails: ["luna@example.com"],
								status: "opened",
								createdAt: "2026-01-01T00:00:00.000Z",
								origin: { type: "automation", id: "aut_1", name: "Onboarding" },
							},
						],
						total: 1,
						page: 1,
						limit: 20,
					},
				},
			],
			"list_emails",
			{
				recipient: "luna@example.com",
				status: "opened",
				since: "2026-01-01T00:00:00Z",
			},
		);
		expect(onlyCall(calls).query).toEqual({
			page: "1",
			limit: "20",
			recipient: "luna@example.com",
			status: "opened",
			start_date: "2026-01-01T00:00:00Z",
		});
		expect(readProperty(structuredContent(result), "emails")).toEqual([
			{
				id: "log_1",
				subject: "Welcome",
				from: "hi@send.example.com",
				to: ["luna@example.com"],
				status: "opened",
				source: null,
				origin: { type: "automation", id: "aut_1", name: "Onboarding" },
				hasAttachments: false,
				createdAt: "2026-01-01T00:00:00.000Z",
			},
		]);
	});
});

describe("get_email", () => {
	test("omits bodies by default and returns the timeline", async () => {
		const { result } = await call(
			[
				{
					method: "GET",
					path: "/api/logs/v1/emails/log_1",
					body: emailLogFixture(),
				},
			],
			"get_email",
			{ id: "log_1" },
		);
		const email = readProperty(structuredContent(result), "email");
		expect(readProperty(email, "html")).toBeUndefined();
		expect(readProperty(email, "text")).toBeUndefined();
		expect(readProperty(email, "cc")).toEqual([]);
		expect(readProperty(email, "attachments")).toEqual([
			{ filename: "a.pdf", contentType: "application/pdf", sizeBytes: 10 },
		]);
		expect(readProperty(email, "events")).toEqual([
			{
				type: "delivered",
				createdAt: "2026-01-01T00:00:02.000Z",
				metadata: null,
			},
		]);
	});

	test("includes bodies on request", async () => {
		const { result } = await call(
			[
				{
					method: "GET",
					path: "/api/logs/v1/emails/log_1",
					body: emailLogFixture(),
				},
			],
			"get_email",
			{ id: "log_1", includeBody: true },
		);
		const email = readProperty(structuredContent(result), "email");
		expect(readProperty(email, "html")).toBe("<p>Hello</p>");
		expect(readProperty(email, "text")).toBe("Hello");
	});

	test("maps 404 to email_not_found", async () => {
		const { result } = await call(
			[
				{
					method: "GET",
					path: "/api/logs/v1/emails/log_missing",
					status: 404,
					body: { message: "Email log not found" },
				},
			],
			"get_email",
			{ id: "log_missing" },
		);
		expect(readProperty(errorJson(result), "code")).toBe("email_not_found");
	});
});

describe("get_email_stats", () => {
	test("zips the series and computes totals", async () => {
		const { calls, result } = await call(
			[
				{
					method: "GET",
					path: "/api/logs/v1/emails/stats",
					body: {
						dates: ["2026-01-01", "2026-01-02"],
						sent: [10, 30],
						delivered: [9, 27],
						bounced: [1, 3],
						complaint: [0, 1],
						opened: [5, 12],
						rate: [90, 90],
						bounceBreakdown: { transient: [], permanent: [], undetermined: [] },
					},
				},
			],
			"get_email_stats",
			{ domainId: "dom_1" },
		);
		expect(onlyCall(calls).query).toEqual({
			interval: "day",
			domain_id: "dom_1",
		});
		const data = structuredContent(result);
		expect(readProperty(data, "totals")).toEqual({
			sent: 40,
			delivered: 36,
			opened: 17,
			bounced: 4,
			complaints: 1,
			unsubscribed: 0,
			deliveryRate: 90,
		});
		const series = readProperty(data, "series");
		if (!Array.isArray(series)) {
			throw new Error("expected series");
		}
		expect(series[1]).toEqual({
			date: "2026-01-02",
			sent: 30,
			delivered: 27,
			opened: 12,
			bounced: 3,
			complaints: 1,
			unsubscribed: 0,
			deliveryRate: 90,
		});
	});
});

describe("resend_email", () => {
	test("posts to the resend route and is never retryable after a timeout", async () => {
		const ok = await call(
			[
				{
					method: "POST",
					path: "/api/mail/v1/resend/log_1",
					body: {
						success: true,
						id: "log_2",
						messageId: "<msg_2@send.example.com>",
						status: "sent",
						timestamp: "2026-01-03T00:00:00.000Z",
					},
				},
			],
			"resend_email",
			{ id: "log_1" },
		);
		expect(readProperty(structuredContent(ok.result), "id")).toBe("log_2");
		const handler = createHttpHandler({
			config: testConfig({ timeoutMs: 50 }),
			logger: silentLogger(),
			fetch: mockReloop([
				{ method: "POST", path: "/api/mail/v1/resend/log_1", delayMs: 500 },
			]).fetch,
		});
		const { client, close } = await connectHttpClient(handler);
		const timedOut = await client.callTool({
			name: "resend_email",
			arguments: { id: "log_1" },
		});
		expect(readProperty(errorJson(timedOut), "retryable")).toBe(false);
		await close();
		await handler.close();
	});
});

describe("templates", () => {
	test("list_templates exposes variables without editor content", async () => {
		const { result } = await call(
			[
				{
					method: "GET",
					path: "/api/template/v1/list",
					body: {
						templates: [{ ...templateFixture(), content: [{ type: "text" }] }],
						total: 1,
						page: 1,
						limit: 20,
					},
				},
			],
			"list_templates",
			{},
		);
		const templates = readProperty(structuredContent(result), "templates");
		if (!Array.isArray(templates)) {
			throw new Error("expected templates");
		}
		expect(readProperty(templates[0], "content")).toBeUndefined();
		expect(readProperty(templates[0], "variables")).toEqual([
			{ name: "plan", type: "string", defaultValue: "free" },
		]);
	});

	test("get_template maps null variables to an empty list", async () => {
		const { result } = await call(
			[
				{
					method: "GET",
					path: "/api/template/v1/tpl_1",
					body: templateFixture({ variables: null }),
				},
			],
			"get_template",
			{ id: "tpl_1" },
		);
		expect(
			readProperty(
				readProperty(structuredContent(result), "template"),
				"variables",
			),
		).toEqual([]);
	});

	test("send_test_email posts the recipient and variables", async () => {
		const { calls, result } = await call(
			[
				{
					method: "POST",
					path: "/api/template/v1/tpl_1/test",
					body: { success: true },
				},
			],
			"send_test_email",
			{ templateId: "tpl_1", to: "me@example.com", variables: { plan: "pro" } },
		);
		expect(onlyCall(calls).body).toEqual({
			to: "me@example.com",
			variables: { plan: "pro" },
		});
		expect(structuredContent(result)).toEqual({ sent: true });
	});
});

describe("properties", () => {
	const property = {
		object: "contact_property",
		id: "prop_1",
		propertyName: "company_name",
		propertyType: "string",
		defaultValue: "Unknown",
		createdAt: "2026-01-01T00:00:00.000Z",
		updatedAt: "2026-01-02T00:00:00.000Z",
	};

	test("list_properties renames fields", async () => {
		const { calls, result } = await call(
			[
				{
					method: "GET",
					path: "/api/contacts/v1/properties/list",
					body: {
						object: "contact_property",
						properties: [property],
						total: 1,
						page: 1,
						limit: 100,
						event: "property.listed",
					},
				},
			],
			"list_properties",
			{ type: "string" },
		);
		expect(onlyCall(calls).query).toEqual({
			page: "1",
			limit: "100",
			type: "string",
		});
		expect(readProperty(structuredContent(result), "properties")).toEqual([
			{
				id: "prop_1",
				name: "company_name",
				type: "string",
				fallbackValue: "Unknown",
				createdAt: "2026-01-01T00:00:00.000Z",
				updatedAt: "2026-01-02T00:00:00.000Z",
			},
		]);
	});

	test("create_property rejects keys contacts cannot store", async () => {
		const { calls, result } = await call([], "create_property", {
			name: "Company Name",
			type: "string",
		});
		expect(readProperty(result, "isError")).toBe(true);
		expect(calls).toHaveLength(0);
	});

	test("create_property maps 409 to property_already_exists", async () => {
		const { calls, result } = await call(
			[
				{
					method: "POST",
					path: "/api/contacts/v1/properties/create",
					status: 409,
					body: { message: "Property already exists", why: "x", fix: "y" },
				},
			],
			"create_property",
			{ name: "company_name", type: "string" },
		);
		expect(onlyCall(calls).body).toEqual({
			name: "company_name",
			type: "string",
		});
		expect(readProperty(errorJson(result), "code")).toBe(
			"property_already_exists",
		);
	});

	test("update_property can clear the fallback", async () => {
		const { calls } = await call(
			[
				{
					method: "PATCH",
					path: "/api/contacts/v1/properties/prop_1",
					body: { ...property, defaultValue: null },
				},
			],
			"update_property",
			{ id: "prop_1", fallbackValue: null },
		);
		expect(onlyCall(calls).body).toEqual({ fallbackValue: null });
	});

	test("delete_property confirms the deleted id", async () => {
		const { result } = await call(
			[
				{
					method: "DELETE",
					path: "/api/contacts/v1/properties/prop_1",
					body: {
						object: "contact_property",
						success: true,
						id: "prop_1",
						name: "company_name",
						event: "property.deleted",
					},
				},
			],
			"delete_property",
			{ id: "prop_1" },
		);
		expect(structuredContent(result)).toEqual({ deleted: true, id: "prop_1" });
	});
});
