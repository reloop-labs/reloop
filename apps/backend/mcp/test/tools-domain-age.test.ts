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

const ageResponse = {
	domain: "reloop.sh",
	registrableDomain: "reloop.sh",
	resolvedAt: "2026-10-12T17:42:29.084Z",
	responseTimeMs: 364,
	verdict: "mature",
	headline: "This domain is 1 year, 3 months, 9 days old",
	summary:
		"Registered 1 year, 3 months, 9 days ago (466 days). Domain age is completely mature and will not impact email deliverability.",
	disclaimer: "Gmail and Outlook do not publish an exact age threshold.",
	age: {
		createdAt: "2025-07-03T06:17:03.176Z",
		ageDays: 466,
		expiresAt: "2027-07-03T06:17:03.176Z",
		updatedAt: "2026-08-11T23:36:36.092Z",
		source: "rdap",
	},
	registry: {
		registrar: "Spaceship, Inc.",
		status: ["client transfer prohibited"],
		tld: "sh",
	},
	nameservers: {
		hosts: ["leanna.ns.cloudflare.com", "elijah.ns.cloudflare.com"],
		provider: "Cloudflare",
		kind: "production",
	},
	emailSetup: { spf: true, dmarc: true, dmarcPolicy: "reject", mx: true },
	nextStep: {
		title: "Send high-volume email with Reloop",
		body: "Scale your emails with Reloop.",
		href: "/dashboard/signup",
	},
	warnings: [],
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
		name: "check_domain_age",
		arguments: { ...args },
	});
	await close();
	await handler.close();
	return { calls: mock.calls, result };
}

describe("check_domain_age", () => {
	test("posts the trimmed domain and returns age, stage and setup", async () => {
		const { calls, result } = await call(
			[
				{
					method: "POST",
					path: "/api/tools/v1/domain-age",
					body: ageResponse,
				},
			],
			{ domain: " reloop.sh  " },
		);
		expect(calls).toHaveLength(1);
		expect(calls[0]?.body).toEqual({ domain: "reloop.sh" });
		expect(structuredContent(result)).toEqual({
			domain: "reloop.sh",
			registrableDomain: "reloop.sh",
			verdict: "mature",
			headline: "This domain is 1 year, 3 months, 9 days old",
			summary:
				"Registered 1 year, 3 months, 9 days ago (466 days). Domain age is completely mature and will not impact email deliverability.",
			createdAt: "2025-07-03T06:17:03.176Z",
			ageDays: 466,
			expiresAt: "2027-07-03T06:17:03.176Z",
			updatedAt: "2026-08-11T23:36:36.092Z",
			registrar: "Spaceship, Inc.",
			registryStatus: ["client transfer prohibited"],
			nameserverProvider: "Cloudflare",
			nameserverKind: "production",
			emailSetup: { spf: true, dmarc: true, dmarcPolicy: "reject", mx: true },
			warnings: [],
		});
	});

	test("returns null age fields for an unregistered domain", async () => {
		const { result } = await call(
			[
				{
					method: "POST",
					path: "/api/tools/v1/domain-age",
					body: {
						...ageResponse,
						verdict: "not_registered",
						headline: "This domain isn’t registered",
						age: {
							createdAt: null,
							ageDays: null,
							expiresAt: null,
							updatedAt: null,
							source: "none",
						},
						registry: { registrar: null, status: [], tld: "sh" },
					},
				},
			],
			{ domain: "nothing-here-reloop.sh" },
		);
		const content = structuredContent(result);
		expect(readProperty(content, "verdict")).toBe("not_registered");
		expect(readProperty(content, "ageDays")).toBeNull();
		expect(readProperty(content, "registrar")).toBeNull();
	});

	test("surfaces the rate limit as a retryable error", async () => {
		const { result } = await call(
			[
				{
					method: "POST",
					path: "/api/tools/v1/domain-age",
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
	});
});
