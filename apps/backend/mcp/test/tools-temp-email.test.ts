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

const disposableResponse = {
	input: "you@mailinator.com",
	kind: "email",
	domain: "mailinator.com",
	unicodeDomain: null,
	verdict: "disposable",
	isValidSyntax: true,
	syntaxFailure: null,
	isDisposable: true,
	disposableMatch: { kind: "exact", domain: "mailinator.com" },
	isAllowlisted: false,
	isRoleAddress: false,
	isFreeProvider: false,
	signals: {
		syntax: "pass",
		disposable: "fail",
		role: "pass",
		freeProvider: "pass",
	},
	mxRecords: ["mail.mailinator.com"],
	confidence: 0.999,
	riskScore: 0.94,
	flags: ["DISPOSABLE_DOMAIN", "PUBLIC_INBOX_DETECTED"],
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
		name: "check_temp_email",
		arguments: { ...args },
	});
	await close();
	await handler.close();
	return { calls: mock.calls, result };
}

describe("check_temp_email", () => {
	test("posts the trimmed address and returns the verdict", async () => {
		const { calls, result } = await call(
			[
				{
					method: "POST",
					path: "/api/tools/v1/temp-email-checker",
					body: disposableResponse,
				},
			],
			{ email: "  you@mailinator.com " },
		);
		expect(calls).toHaveLength(1);
		expect(calls[0]?.body).toEqual({ email: "you@mailinator.com" });
		expect(structuredContent(result)).toEqual({
			input: "you@mailinator.com",
			kind: "email",
			domain: "mailinator.com",
			verdict: "disposable",
			isValidSyntax: true,
			isDisposable: true,
			isRoleAddress: false,
			isFreeProvider: false,
			mxRecords: ["mail.mailinator.com"],
			confidence: 0.999,
			riskScore: 0.94,
			flags: ["DISPOSABLE_DOMAIN", "PUBLIC_INBOX_DETECTED"],
		});
	});

	test("surfaces the rate limit as a retryable error", async () => {
		const { result } = await call(
			[
				{
					method: "POST",
					path: "/api/tools/v1/temp-email-checker",
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
			{ email: "you@mailinator.com" },
		);
		const error = errorJson(result);
		expect(readProperty(error, "code")).toBe("rate_limited");
		expect(readProperty(error, "retryable")).toBe(true);
		expect(readProperty(error, "retryAfterSeconds")).toBe(30);
	});
});
