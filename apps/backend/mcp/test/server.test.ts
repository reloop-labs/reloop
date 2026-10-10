import { describe, expect, test } from "bun:test";
import {
	Client,
	StreamableHTTPClientTransport,
} from "@modelcontextprotocol/client";
import { createHttpHandler } from "../src/transports/http";
import {
	API_KEY,
	connectHttpClient,
	contactFixture,
	errorJson,
	firstText,
	listFixture,
	mockReloop,
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
	return { mock, handler };
}

describe("mcp server over streamable http", () => {
	test("lists the tools in a deterministic order", async () => {
		const { handler } = harness([]);
		const { client, close } = await connectHttpClient(handler);
		expect(client.getProtocolEra()).toBe("modern");
		const listed = await client.listTools();
		expect(listed.tools.map((tool) => tool.name)).toEqual([
			"contacts_list",
			"contacts_get",
			"contacts_create",
			"contacts_update",
			"contacts_delete",
			"email_send",
		]);
		for (const tool of listed.tools) {
			expect(tool.inputSchema).toBeDefined();
			expect(tool.outputSchema).toBeDefined();
			expect(tool.title).toBeTruthy();
			expect(tool.description?.length ?? 0).toBeGreaterThan(0);
		}
		const byName = new Map(
			listed.tools.map((tool) => [tool.name, tool.annotations]),
		);
		expect(byName.get("contacts_list")).toMatchObject({
			readOnlyHint: true,
			destructiveHint: false,
			idempotentHint: true,
			openWorldHint: false,
		});
		expect(byName.get("contacts_get")).toMatchObject({
			readOnlyHint: true,
			destructiveHint: false,
			idempotentHint: true,
			openWorldHint: false,
		});
		expect(byName.get("contacts_create")).toMatchObject({
			readOnlyHint: false,
			destructiveHint: false,
			idempotentHint: false,
			openWorldHint: false,
		});
		expect(byName.get("contacts_update")).toMatchObject({
			readOnlyHint: false,
			destructiveHint: false,
			idempotentHint: true,
			openWorldHint: false,
		});
		expect(byName.get("contacts_delete")).toMatchObject({
			readOnlyHint: false,
			destructiveHint: true,
			idempotentHint: true,
			openWorldHint: false,
		});
		await close();
		await handler.close();
	});

	test("rejects arguments that violate the input schema", async () => {
		const { handler } = harness([]);
		const { client, close } = await connectHttpClient(handler);
		const result = await client.callTool({
			name: "contacts_list",
			arguments: { limit: 500 },
		});
		expect(result.isError).toBe(true);
		expect(firstText(result)).toContain("limit");
		await close();
		await handler.close();
	});

	test("rejects contacts_get with both or neither selector", async () => {
		const { handler } = harness([]);
		const { client, close } = await connectHttpClient(handler);
		const both = await client.callTool({
			name: "contacts_get",
			arguments: { id: "con_123", email: "luna@example.com" },
		});
		expect(both.isError).toBe(true);
		expect(firstText(both)).toContain("exactly one");
		const neither = await client.callTool({
			name: "contacts_get",
			arguments: {},
		});
		expect(neither.isError).toBe(true);
		await close();
		await handler.close();
	});

	test("returns matching structured and text content", async () => {
		const { handler } = harness([
			{
				method: "GET",
				path: "/api/contacts/retrieve/con_123",
				body: contactFixture(),
			},
		]);
		const { client, close } = await connectHttpClient(handler);
		const result = await client.callTool({
			name: "contacts_get",
			arguments: { id: "con_123" },
		});
		const data = structuredContent(result);
		expect(readProperty(readProperty(data, "contact"), "email")).toBe(
			"luna@example.com",
		);
		expect(JSON.parse(firstText(result))).toEqual(data);
		await close();
		await handler.close();
	});

	test("surfaces an upstream 404 as a tool error", async () => {
		const { handler } = harness([
			{
				method: "GET",
				path: "/api/contacts/retrieve/con_missing",
				status: 404,
				body: { message: "Contact not found", fix: "Check the contact id" },
			},
		]);
		const { client, close } = await connectHttpClient(handler);
		const result = await client.callTool({
			name: "contacts_get",
			arguments: { id: "con_missing" },
		});
		expect(result.isError).toBe(true);
		const error = errorJson(result);
		expect(readProperty(error, "code")).toBe("contact_not_found");
		expect(readProperty(error, "retryable")).toBe(false);
		expect(readProperty(error, "fix")).toBeTruthy();
		await close();
		await handler.close();
	});

	test("surfaces an upstream 401 as unauthorized", async () => {
		const { handler } = harness([
			{
				method: "GET",
				path: "/api/contacts/retrieve/con_123",
				status: 401,
				body: { message: "Invalid API key" },
			},
		]);
		const { client, close } = await connectHttpClient(handler);
		const result = await client.callTool({
			name: "contacts_get",
			arguments: { id: "con_123" },
		});
		expect(readProperty(errorJson(result), "code")).toBe("unauthorized");
		await close();
		await handler.close();
	});

	test("serves a 2025-era client that opens with initialize", async () => {
		const { handler } = harness([
			{
				method: "GET",
				path: "/api/contacts/retrieve/con_123",
				body: contactFixture(),
			},
		]);
		const transport = new StreamableHTTPClientTransport(
			new URL("http://127.0.0.1/mcp"),
			{
				fetch: (url, init) => handler.fetch(new Request(url, init)),
				requestInit: {
					headers: { host: "127.0.0.1", authorization: `Bearer ${API_KEY}` },
				},
			},
		);
		const client = new Client({ name: "legacy-harness", version: "1.0.0" });
		await client.connect(transport);
		expect(client.getProtocolEra()).toBe("legacy");
		const listed = await client.listTools();
		expect(listed.tools).toHaveLength(6);
		const result = await client.callTool({
			name: "contacts_get",
			arguments: { id: "con_123" },
		});
		expect(
			readProperty(readProperty(structuredContent(result), "contact"), "id"),
		).toBe("con_123");
		await client.close();
		await handler.close();
	});

	test("serves sequential calls statelessly", async () => {
		const { handler } = harness([
			{
				method: "GET",
				path: "/api/contacts/retrieve/con_123",
				body: contactFixture(),
			},
		]);
		const { client, close } = await connectHttpClient(handler);
		const first = await client.callTool({
			name: "contacts_get",
			arguments: { id: "con_123" },
		});
		const second = await client.callTool({
			name: "contacts_get",
			arguments: { id: "con_123" },
		});
		expect(first.isError).toBeUndefined();
		expect(second.isError).toBeUndefined();
		await close();
		await handler.close();
	});

	test("serves OAuth clients with the bearer forwarded upstream", async () => {
		const { mock, handler } = harness([
			{
				method: "GET",
				path: "/api/contacts/list",
				body: listFixture([contactFixture()]),
			},
		]);
		const jwt = "eyJhbGciOiJFZERTQSJ9.eyJzdWIiOiJ1c2VyLTEifQ.c2lnbmF0dXJl";
		const { client, close } = await connectHttpClient(handler, {
			apiKey: jwt,
		});
		const result = await client.callTool({
			name: "contacts_list",
			arguments: {},
		});
		expect(result.isError).toBeUndefined();
		expect(mock.calls[0]?.headers["authorization"]).toBe(`Bearer ${jwt}`);
		expect(mock.calls[0]?.headers["x-api-key"]).toBeUndefined();
		await close();
		await handler.close();
	});
});
