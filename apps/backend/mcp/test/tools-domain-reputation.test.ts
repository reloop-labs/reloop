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

const breakdown = {
	authentication: {
		score: 90,
		weight: 35,
		status: "pass",
		summary: "SPF pass, DKIM fail, DMARC pass",
	},
	blocklist: {
		score: 100,
		weight: 30,
		status: "pass",
		summary: "7/7 domain blocklists clean",
	},
	domainAge: {
		score: 100,
		weight: 20,
		status: "pass",
		summary: "466 days old (mature)",
	},
	dnsHealth: {
		score: 100,
		weight: 15,
		status: "pass",
		summary: "2 MX, 2 NS, SSL active",
	},
};

const checks = [
	{
		id: "auth_dkim",
		category: "authentication",
		label: "DKIM Signature",
		status: "fail",
		detail: "No standard DKIM selector detected in DNS.",
	},
	{
		id: "auth_dmarc",
		category: "authentication",
		label: "DMARC Policy",
		status: "pass",
		detail: "DMARC policy is set to 'reject' (pct=100%).",
		record: "v=DMARC1; p=reject;",
	},
];

const recommendations = [
	"No aggregate reporting address ('rua=') configured. You will not receive DMARC delivery reports.",
];

const reputationResponse = {
	domain: "reloop.sh",
	resolvedAt: "2026-10-12T17:23:07.410Z",
	responseTimeMs: 2487,
	score: 97,
	grade: "A+",
	verdict: "excellent",
	verdictLabel: "Outstanding reputation. Maximum deliverability confidence.",
	breakdown,
	details: {
		blocklist: { cleanCount: 7, listedCount: 0, totalChecked: 7, listings: [] },
	},
	checks,
	recommendations,
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
		name: "check_domain_reputation",
		arguments: { ...args },
	});
	await close();
	await handler.close();
	return { calls: mock.calls, result };
}

describe("check_domain_reputation", () => {
	test("posts the trimmed domain and returns the report without raw details", async () => {
		const { calls, result } = await call(
			[
				{
					method: "POST",
					path: "/api/tools/v1/domain-reputation",
					body: reputationResponse,
				},
			],
			{ domain: "  reloop.sh " },
		);
		expect(calls).toHaveLength(1);
		expect(calls[0]?.body).toEqual({ domain: "reloop.sh" });
		expect(structuredContent(result)).toEqual({
			domain: "reloop.sh",
			score: 97,
			grade: "A+",
			verdict: "excellent",
			verdictLabel:
				"Outstanding reputation. Maximum deliverability confidence.",
			breakdown,
			checks,
			recommendations,
		});
	});

	test("maps an invalid domain to a validation error", async () => {
		const { result } = await call(
			[
				{
					method: "POST",
					path: "/api/tools/v1/domain-reputation",
					status: 400,
					body: {
						message: "Invalid domain",
						why: "The value was not a valid domain name.",
						fix: "Enter a valid root or sending domain like example.com.",
					},
				},
			],
			{ domain: "not a domain" },
		);
		const error = errorJson(result);
		expect(readProperty(error, "code")).toBe("validation_error");
		expect(readProperty(error, "retryable")).toBe(false);
	});

	test("surfaces the rate limit as a retryable error", async () => {
		const { result } = await call(
			[
				{
					method: "POST",
					path: "/api/tools/v1/domain-reputation",
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
			{ domain: "reloop.sh" },
		);
		const error = errorJson(result);
		expect(readProperty(error, "code")).toBe("rate_limited");
		expect(readProperty(error, "retryable")).toBe(true);
		expect(readProperty(error, "retryAfterSeconds")).toBe(30);
	});
});
