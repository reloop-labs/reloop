import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
import { API_KEY, contactFixture, readProperty } from "./helpers";

let upstream: ReturnType<typeof Bun.serve>;
let baseUrl: string;

beforeAll(() => {
	upstream = Bun.serve({
		port: 0,
		hostname: "127.0.0.1",
		fetch(request) {
			if (request.headers.get("user-agent") === null) {
				return Response.json(
					{
						message: "User-Agent header is required",
						why: "Missing header",
						fix: "Send a User-Agent",
					},
					{ status: 400 },
				);
			}
			if (request.headers.get("x-api-key") !== API_KEY) {
				return Response.json(
					{
						message: "Invalid API key",
						why: "Unknown key",
						fix: "Check the key",
					},
					{ status: 401 },
				);
			}
			if (new URL(request.url).pathname === "/api/contacts/retrieve/con_123") {
				return Response.json(contactFixture());
			}
			return Response.json({ message: "Not found" }, { status: 404 });
		},
	});
	baseUrl = `http://127.0.0.1:${upstream.port}`;
});

afterAll(async () => {
	await upstream.stop(true);
});

function spawnClient(env: Record<string, string>): {
	client: Client;
	transport: StdioClientTransport;
} {
	const transport = new StdioClientTransport({
		command: "bun",
		args: ["src/cli.ts", "--transport", "stdio"],
		env,
	});
	const client = new Client(
		{ name: "test-harness", version: "1.0.0" },
		{ versionNegotiation: { mode: "auto" } },
	);
	return { client, transport };
}

describe("stdio transport", () => {
	test("serves tools over a spawned process", async () => {
		const { client, transport } = spawnClient({
			PATH: process.env.PATH ?? "",
			HOME: process.env.HOME ?? "",
			RELOOP_API_KEY: API_KEY,
			RELOOP_BASE_URL: baseUrl,
			LOG_LEVEL: "silent",
		});
		await client.connect(transport);
		const listed = await client.listTools();
		expect(listed.tools).toHaveLength(6);
		const result = await client.callTool({
			name: "contacts_get",
			arguments: { id: "con_123" },
		});
		const contact = readProperty(
			readProperty(result, "structuredContent"),
			"contact",
		);
		expect(readProperty(contact, "id")).toBe("con_123");
		await client.close();
	});

	test("refuses to start without an API key", async () => {
		const { client, transport } = spawnClient({
			PATH: process.env.PATH ?? "",
			HOME: process.env.HOME ?? "",
			RELOOP_BASE_URL: baseUrl,
			LOG_LEVEL: "silent",
		});
		let timer: ReturnType<typeof setTimeout> | undefined;
		const outcome = await Promise.race([
			client.connect(transport).then(
				() => "connected",
				() => "failed",
			),
			new Promise<string>((resolve) => {
				timer = setTimeout(() => resolve("timeout"), 5000);
			}),
		]);
		clearTimeout(timer);
		expect(outcome).toBe("failed");
		await transport.close();
	});
});
