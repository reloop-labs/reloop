import { describe, expect, test } from "bun:test";
import { createHttpHandler } from "../src/transports/http";
import {
	connectHttpClient,
	errorJson,
	mockReloop,
	type Route,
	readProperty,
	silentLogger,
	structuredContent,
	testConfig,
} from "./helpers";

const bimiResponse = {
	domain: "cnn.com",
	queryName: "default._bimi.cnn.com",
	verdict: "pass",
	bimiRecord:
		"v=BIMI1; l=https://example.com/cnn.svg; a=https://example.com/cnn.pem",
	logoUrl: "https://example.com/cnn.svg",
	authorityUrl: "https://example.com/cnn.pem",
	dmarcRecord: "v=DMARC1; p=reject;",
	dmarcPolicy: "reject",
	dmarcPct: 100,
	dmarcEnforced: true,
	logo: {
		fetched: true,
		contentType: "image/svg+xml",
		tinyPsOk: true,
		issues: [],
	},
	checks: [
		{
			id: "bimi-present",
			label: "BIMI TXT",
			status: "pass",
			detail: "Found BIMI record at default._bimi.cnn.com.",
			record:
				"v=BIMI1; l=https://example.com/cnn.svg; a=https://example.com/cnn.pem",
		},
		{
			id: "dmarc",
			label: "DMARC enforcement",
			status: "pass",
			detail: "DMARC is at enforcement (p=reject, pct=100).",
		},
	],
	recommendations: [],
};

async function call(routes: Route[], args: object) {
	const mock = mockReloop(routes);
	const handler = createHttpHandler({
		config: testConfig(),
		logger: silentLogger(),
		fetch: mock.fetch,
	});
	const { client, close } = await connectHttpClient(handler);
	const result = await client.callTool({
		name: "check_bimi",
		arguments: { ...args },
	});
	await close();
	await handler.close();
	return { calls: mock.calls, result };
}

describe("check_bimi", () => {
	test("posts the trimmed domain and returns the verdict and checks", async () => {
		const { calls, result } = await call(
			[
				{
					method: "POST",
					path: "/api/tools/v1/bimi-check",
					body: bimiResponse,
				},
			],
			{ domain: " cnn.com  " },
		);
		expect(calls).toHaveLength(1);
		expect(calls[0]?.body).toEqual({ domain: "cnn.com" });
		expect(structuredContent(result)).toEqual({
			domain: "cnn.com",
			queryName: "default._bimi.cnn.com",
			verdict: "pass",
			bimiRecord:
				"v=BIMI1; l=https://example.com/cnn.svg; a=https://example.com/cnn.pem",
			logoUrl: "https://example.com/cnn.svg",
			authorityUrl: "https://example.com/cnn.pem",
			dmarcPolicy: "reject",
			dmarcEnforced: true,
			checks: [
				{
					id: "bimi-present",
					label: "BIMI TXT",
					status: "pass",
					detail: "Found BIMI record at default._bimi.cnn.com.",
					fix: null,
				},
				{
					id: "dmarc",
					label: "DMARC enforcement",
					status: "pass",
					detail: "DMARC is at enforcement (p=reject, pct=100).",
					fix: null,
				},
			],
			recommendations: [],
		});
	});

	test("returns the fix for a domain with no BIMI record", async () => {
		const { result } = await call(
			[
				{
					method: "POST",
					path: "/api/tools/v1/bimi-check",
					body: {
						...bimiResponse,
						domain: "example.com",
						queryName: "default._bimi.example.com",
						verdict: "fail",
						bimiRecord: null,
						logoUrl: null,
						authorityUrl: null,
						checks: [
							{
								id: "bimi-present",
								label: "BIMI TXT",
								status: "fail",
								detail: "No BIMI record at default._bimi.example.com.",
								fix: 'Publish a TXT record at default._bimi.example.com: "v=BIMI1; l=https://…/logo.svg;"',
							},
						],
						recommendations: ["Publish a BIMI TXT record."],
					},
				},
			],
			{ domain: "example.com" },
		);
		const content = structuredContent(result);
		expect(readProperty(content, "verdict")).toBe("fail");
		expect(readProperty(content, "logoUrl")).toBeNull();
		const checks = readProperty(content, "checks");
		expect(Array.isArray(checks)).toBe(true);
		const first = Array.isArray(checks) ? checks[0] : undefined;
		expect(readProperty(first, "fix")).toContain("default._bimi.example.com");
	});

	test("surfaces the rate limit as a retryable error", async () => {
		const { result } = await call(
			[
				{
					method: "POST",
					path: "/api/tools/v1/bimi-check",
					status: 429,
					headers: { "retry-after": "30" },
					body: {
						message: "Too many requests",
						why: "Rate limited",
						fix: "Wait and retry",
						retryAfter: 30,
					},
				},
			],
			{ domain: "cnn.com" },
		);
		const error = errorJson(result);
		expect(readProperty(error, "code")).toBe("rate_limited");
		expect(readProperty(error, "retryable")).toBe(true);
	});
});
