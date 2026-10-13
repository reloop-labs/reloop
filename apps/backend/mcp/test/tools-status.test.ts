import { describe, expect, test } from "bun:test";
import { createHttpHandler } from "../src/transports/http";
import {
	connectHttpClient,
	mockReloop,
	type Route,
	readProperty,
	silentLogger,
	structuredContent,
	testConfig,
} from "./helpers";

function domainPage(total: number): Route["body"] {
	return {
		object: "domain",
		domains: [],
		total,
		page: 1,
		limit: 1,
		event: "domain.listed",
	};
}

async function status(totals: { all: number; active: number }) {
	const mock = mockReloop([
		{
			method: "GET",
			path: "/api/domain/v1/list",
			body: domainPage(totals.all),
			once: true,
		},
		{
			method: "GET",
			path: "/api/domain/v1/list",
			body: domainPage(totals.active),
			once: true,
		},
	]);
	const handler = createHttpHandler({
		config: testConfig(),
		logger: silentLogger(),
		fetch: mock.fetch,
	});
	const { client, close } = await connectHttpClient(handler);
	const result = await client.callTool({
		name: "get_reloop_status",
		arguments: {},
	});
	const instructions = client.getInstructions();
	await close();
	await handler.close();
	return { calls: mock.calls, result, instructions };
}

describe("get_reloop_status", () => {
	test("confirms the connection and counts active domains", async () => {
		const { calls, result } = await status({ all: 3, active: 2 });
		expect(calls.map((call) => call.query.status)).toEqual([
			undefined,
			"active",
		]);
		const data = structuredContent(result);
		expect(readProperty(data, "connected")).toBe(true);
		expect(readProperty(data, "domains")).toEqual({ total: 3, active: 2 });
		expect(String(readProperty(data, "nextStep"))).toContain("send_email");
	});

	test("points to create_domain when there are no domains", async () => {
		const { result } = await status({ all: 0, active: 0 });
		expect(
			String(readProperty(structuredContent(result), "nextStep")),
		).toContain("create_domain");
	});

	test("server instructions point agents at the status tool", async () => {
		const { instructions } = await status({ all: 0, active: 0 });
		expect(instructions).toContain("get_reloop_status");
	});
});
