import { describe, expect, test } from "bun:test";
import { createHttpHandler } from "../src/transports/http";
import {
	connectHttpClient,
	contactFixture,
	errorJson,
	firstText,
	listFixture,
	mockReloop,
	type RecordedCall,
	type Route,
	readProperty,
	silentLogger,
	structuredContent,
	testConfig,
} from "./helpers";

function harness(routes: Route[]) {
	const mock = mockReloop(routes);
	const handler = createHttpHandler({
		config: testConfig(),
		logger: silentLogger(),
		fetch: mock.fetch,
	});
	return { calls: mock.calls, handler };
}

function upstream(calls: RecordedCall[], path: string): RecordedCall {
	const call = calls.find((entry) => entry.path === path);
	if (call === undefined) {
		throw new Error(`no upstream call to ${path}`);
	}
	return call;
}

describe("contacts_list", () => {
	test("forwards the query and maps pagination and counts", async () => {
		const { calls, handler } = harness([
			{
				method: "GET",
				path: "/api/contacts/list",
				body: listFixture([contactFixture()], {
					page: 2,
					limit: 10,
					total: 25,
					totalContacts: 40,
					subscribedContacts: 30,
					unsubscribedContacts: 10,
				}),
			},
		]);
		const { client, close } = await connectHttpClient(handler);
		const result = await client.callTool({
			name: "contacts_list",
			arguments: { page: 2, limit: 10, status: "subscribed", search: "luna" },
		});
		expect(upstream(calls, "/api/contacts/list").query).toEqual({
			page: "2",
			limit: "10",
			status: "subscribed",
			search: "luna",
		});
		const data = structuredContent(result);
		expect(readProperty(data, "pagination")).toEqual({
			page: 2,
			limit: 10,
			total: 25,
			hasMore: true,
		});
		expect(readProperty(data, "counts")).toEqual({
			total: 40,
			subscribed: 30,
			unsubscribed: 10,
		});
		const contacts = readProperty(data, "contacts");
		if (!Array.isArray(contacts)) {
			throw new Error("expected contacts");
		}
		expect(readProperty(contacts[0], "object")).toBeUndefined();
		expect(readProperty(contacts[0], "event")).toBeUndefined();
		expect(readProperty(contacts[0], "id")).toBe("con_123");
		await close();
		await handler.close();
	});

	test("reports hasMore false on the last page", async () => {
		const { handler } = harness([
			{
				method: "GET",
				path: "/api/contacts/list",
				body: listFixture([contactFixture()], { page: 1, limit: 20, total: 1 }),
			},
		]);
		const { client, close } = await connectHttpClient(handler);
		const result = await client.callTool({
			name: "contacts_list",
			arguments: {},
		});
		expect(
			readProperty(
				readProperty(structuredContent(result), "pagination"),
				"hasMore",
			),
		).toBe(false);
		await close();
		await handler.close();
	});
});

describe("contacts_get by email", () => {
	test("searches by email and prefers the exact match", async () => {
		const { calls, handler } = harness([
			{
				method: "GET",
				path: "/api/contacts/list",
				body: listFixture([
					contactFixture({ id: "con_wide", email: "luna@example.community" }),
					contactFixture({ id: "con_exact", email: "Luna@example.com" }),
				]),
			},
		]);
		const { client, close } = await connectHttpClient(handler);
		const result = await client.callTool({
			name: "contacts_get",
			arguments: { email: "luna@example.com" },
		});
		expect(upstream(calls, "/api/contacts/list").query.search).toBe(
			"luna@example.com",
		);
		expect(
			readProperty(readProperty(structuredContent(result), "contact"), "id"),
		).toBe("con_exact");
		await close();
		await handler.close();
	});

	test("returns contact_not_found when nothing matches", async () => {
		const { handler } = harness([
			{ method: "GET", path: "/api/contacts/list", body: listFixture([]) },
		]);
		const { client, close } = await connectHttpClient(handler);
		const result = await client.callTool({
			name: "contacts_get",
			arguments: { email: "nobody@example.com" },
		});
		expect(result.isError).toBe(true);
		expect(readProperty(errorJson(result), "code")).toBe("contact_not_found");
		await close();
		await handler.close();
	});
});

describe("contacts_create", () => {
	test("forwards the body and maps the created contact", async () => {
		const { calls, handler } = harness([
			{
				method: "POST",
				path: "/api/contacts/create",
				status: 201,
				body: { ...contactFixture(), event: "contact.created" },
			},
		]);
		const { client, close } = await connectHttpClient(handler);
		const args = {
			email: "luna@example.com",
			firstName: "Luna",
			properties: { company: "Reloop" },
			groupIds: ["grp_1"],
			channels: [{ channelId: "chn_1", subscription: "opt_in" }],
		};
		const result = await client.callTool({
			name: "contacts_create",
			arguments: args,
		});
		expect(upstream(calls, "/api/contacts/create").body).toEqual(args);
		const contact = readProperty(structuredContent(result), "contact");
		expect(readProperty(contact, "id")).toBe("con_123");
		expect(readProperty(contact, "event")).toBeUndefined();
		await close();
		await handler.close();
	});

	test("maps a duplicate email to contact_already_exists", async () => {
		const { handler } = harness([
			{
				method: "POST",
				path: "/api/contacts/create",
				status: 409,
				body: { message: "Contact already exists" },
			},
		]);
		const { client, close } = await connectHttpClient(handler);
		const result = await client.callTool({
			name: "contacts_create",
			arguments: { email: "luna@example.com" },
		});
		expect(result.isError).toBe(true);
		expect(readProperty(errorJson(result), "code")).toBe(
			"contact_already_exists",
		);
		await close();
		await handler.close();
	});
});

describe("contacts_update", () => {
	test("patches only the fields that were passed", async () => {
		const { calls, handler } = harness([
			{
				method: "PATCH",
				path: "/api/contacts/con_123",
				body: {
					...contactFixture({ status: "unsubscribed" }),
					event: "contact.updated",
				},
			},
		]);
		const { client, close } = await connectHttpClient(handler);
		const result = await client.callTool({
			name: "contacts_update",
			arguments: { id: "con_123", status: "unsubscribed" },
		});
		const call = upstream(calls, "/api/contacts/con_123");
		expect(call.method).toBe("PATCH");
		expect(call.body).toEqual({ status: "unsubscribed" });
		expect(
			readProperty(
				readProperty(structuredContent(result), "contact"),
				"status",
			),
		).toBe("unsubscribed");
		await close();
		await handler.close();
	});

	test("rejects an update with no fields", async () => {
		const { handler } = harness([]);
		const { client, close } = await connectHttpClient(handler);
		const result = await client.callTool({
			name: "contacts_update",
			arguments: { id: "con_123" },
		});
		expect(result.isError).toBe(true);
		expect(firstText(result)).toContain("at least one field");
		await close();
		await handler.close();
	});
});

describe("contacts_delete", () => {
	test("deletes by id", async () => {
		const { calls, handler } = harness([
			{
				method: "DELETE",
				path: "/api/contacts/con_123",
				body: {
					success: true,
					object: "contact",
					id: "con_123",
					event: "contact.deleted",
				},
			},
		]);
		const { client, close } = await connectHttpClient(handler);
		const result = await client.callTool({
			name: "contacts_delete",
			arguments: { id: "con_123" },
		});
		expect(upstream(calls, "/api/contacts/con_123").method).toBe("DELETE");
		expect(structuredContent(result)).toEqual({ deleted: true, id: "con_123" });
		await close();
		await handler.close();
	});

	test("maps a missing contact to contact_not_found", async () => {
		const { handler } = harness([
			{
				method: "DELETE",
				path: "/api/contacts/con_missing",
				status: 404,
				body: { message: "Contact not found" },
			},
		]);
		const { client, close } = await connectHttpClient(handler);
		const result = await client.callTool({
			name: "contacts_delete",
			arguments: { id: "con_missing" },
		});
		expect(result.isError).toBe(true);
		expect(readProperty(errorJson(result), "code")).toBe("contact_not_found");
		await close();
		await handler.close();
	});
});

describe("identifier hardening", () => {
	test("rejects ids that are not a single path segment", async () => {
		for (const id of ["..", ".", "con/123", "con 123", "con?x=1"]) {
			const { calls, handler } = harness([]);
			const { client, close } = await connectHttpClient(handler);
			const result = await client.callTool({
				name: "contacts_delete",
				arguments: { id },
			});
			expect(result.isError).toBe(true);
			expect(calls.some((call) => call.path.startsWith("/api/contacts"))).toBe(
				false,
			);
			await close();
			await handler.close();
		}
	});

	test("rejects more than 100 properties", async () => {
		const { handler } = harness([]);
		const { client, close } = await connectHttpClient(handler);
		const properties: Record<string, string> = {};
		for (let index = 0; index <= 100; index += 1) {
			properties[`key_${index}`] = "v";
		}
		const result = await client.callTool({
			name: "contacts_create",
			arguments: { email: "luna@example.com", properties },
		});
		expect(result.isError).toBe(true);
		await close();
		await handler.close();
	});
});
