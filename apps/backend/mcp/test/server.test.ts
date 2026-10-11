import { describe, expect, test } from "bun:test";
import {
	Client,
	StreamableHTTPClientTransport,
} from "@modelcontextprotocol/client";
import { tools } from "../src/tools/index";
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
			"list_contacts",
			"get_contact",
			"create_contact",
			"update_contact",
			"delete_contact",
			"list_properties",
			"create_property",
			"update_property",
			"delete_property",
			"list_groups",
			"get_group",
			"create_group",
			"update_group",
			"delete_group",
			"list_group_contacts",
			"add_contact_to_group",
			"remove_contact_from_group",
			"list_channels",
			"get_channel",
			"create_channel",
			"update_channel",
			"delete_channel",
			"set_channel_subscription",
			"send_email",
			"list_emails",
			"get_email",
			"get_email_stats",
			"resend_email",
			"list_templates",
			"get_template",
			"send_test_email",
			"list_api_keys",
			"get_api_key",
			"create_api_key",
			"update_api_key",
			"rotate_api_key",
			"enable_api_key",
			"disable_api_key",
			"delete_api_key",
			"list_domains",
			"get_domain",
			"create_domain",
			"update_domain",
			"verify_domain",
			"delete_domain",
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
		expect(byName.get("list_contacts")).toMatchObject({
			readOnlyHint: true,
			destructiveHint: false,
			idempotentHint: true,
			openWorldHint: false,
		});
		expect(byName.get("get_contact")).toMatchObject({
			readOnlyHint: true,
			destructiveHint: false,
			idempotentHint: true,
			openWorldHint: false,
		});
		expect(byName.get("create_contact")).toMatchObject({
			readOnlyHint: false,
			destructiveHint: false,
			idempotentHint: false,
			openWorldHint: false,
		});
		expect(byName.get("update_contact")).toMatchObject({
			readOnlyHint: false,
			destructiveHint: false,
			idempotentHint: true,
			openWorldHint: false,
		});
		expect(byName.get("delete_contact")).toMatchObject({
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
			name: "list_contacts",
			arguments: { limit: 500 },
		});
		expect(result.isError).toBe(true);
		expect(firstText(result)).toContain("limit");
		await close();
		await handler.close();
	});

	test("rejects get_contact with both or neither selector", async () => {
		const { handler } = harness([]);
		const { client, close } = await connectHttpClient(handler);
		const both = await client.callTool({
			name: "get_contact",
			arguments: { id: "con_123", email: "luna@example.com" },
		});
		expect(both.isError).toBe(true);
		expect(firstText(both)).toContain("exactly one");
		const neither = await client.callTool({
			name: "get_contact",
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
			name: "get_contact",
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
			name: "get_contact",
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
			name: "get_contact",
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
		expect(listed.tools).toHaveLength(tools.length);
		const result = await client.callTool({
			name: "get_contact",
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
			name: "get_contact",
			arguments: { id: "con_123" },
		});
		const second = await client.callTool({
			name: "get_contact",
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
			name: "list_contacts",
			arguments: {},
		});
		expect(result.isError).toBeUndefined();
		expect(mock.calls[0]?.headers["authorization"]).toBe(`Bearer ${jwt}`);
		expect(mock.calls[0]?.headers["x-api-key"]).toBeUndefined();
		await close();
		await handler.close();
	});
});
