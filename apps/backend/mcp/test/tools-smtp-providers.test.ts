import { describe, expect, test } from "bun:test";
import type { SmtpProvider } from "../src/reloop/types";
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

function providerFixture(over: Partial<SmtpProvider> = {}): SmtpProvider {
	return {
		object: "smtp_provider",
		id: "smtp_123",
		name: "example.com",
		host: "smtp.sendgrid.net",
		port: 587,
		security: "starttls",
		username: "apikey",
		hasPassword: true,
		domains: [{ id: "dom_1", domain: "example.com" }],
		status: "ok",
		lastTestedAt: "2026-01-01T00:00:00.000Z",
		lastError: null,
		createdAt: "2026-01-01T00:00:00.000Z",
		updatedAt: "2026-01-01T00:00:00.000Z",
		...over,
	};
}

async function call(routes: Route[], name: string, args: object) {
	const mock = mockReloop(routes);
	const handler = createHttpHandler({
		config: testConfig(),
		logger: silentLogger(),
		fetch: mock.fetch,
	});
	const { client, close } = await connectHttpClient(handler);
	const result = await client.callTool({ name, arguments: { ...args } });
	await close();
	await handler.close();
	return { calls: mock.calls, result };
}

describe("create_smtp_provider", () => {
	test("sends the domain and credentials and never echoes the password", async () => {
		const { calls, result } = await call(
			[
				{
					method: "POST",
					path: "/api/domain/v1/smtp-providers",
					body: providerFixture(),
				},
			],
			"create_smtp_provider",
			{
				domain: "Example.com",
				host: "smtp.sendgrid.net",
				port: 587,
				username: "apikey",
				password: "secret",
			},
		);
		expect(calls[0]?.body).toEqual({
			domain: "example.com",
			host: "smtp.sendgrid.net",
			port: 587,
			username: "apikey",
			password: "secret",
		});
		const provider = readProperty(structuredContent(result), "provider");
		expect(readProperty(provider, "domains")).toEqual([
			{ id: "dom_1", domain: "example.com" },
		]);
		expect(JSON.stringify(provider)).not.toContain("secret");
	});
});

describe("test_smtp_provider", () => {
	test("returns the connection error", async () => {
		const { result } = await call(
			[
				{
					method: "POST",
					path: "/api/domain/v1/smtp-providers/smtp_123/test",
					body: {
						ok: false,
						error: "535 Authentication failed",
						provider: providerFixture({
							status: "failing",
							lastError: "535 Authentication failed",
						}),
					},
				},
			],
			"test_smtp_provider",
			{ id: "smtp_123" },
		);
		const data = structuredContent(result);
		expect(readProperty(data, "ok")).toBe(false);
		expect(readProperty(data, "error")).toBe("535 Authentication failed");
	});
});
