import { describe, expect, test } from "bun:test";
import type { ApiKey, ApiKeyWithSecret } from "../src/reloop/types";
import { createHttpHandler } from "../src/transports/http";
import {
	connectHttpClient,
	errorJson,
	mockReloop,
	type RecordedCall,
	type Route,
	readProperty,
	silentLogger,
	structuredContent,
	testConfig,
} from "./helpers";

const SECRET = "rl_prod_newsecret1234567890abcdef";

function apiKeyFixture(over: Partial<ApiKey> = {}): ApiKey {
	return {
		object: "api_key",
		id: "key_123",
		name: "Production",
		start: "rl_prod_ab",
		prefix: "rl_prod",
		enabled: true,
		requestCount: 42,
		lastRequest: "2026-02-01T00:00:00.000Z",
		expiresAt: null,
		permissions: null,
		createdAt: "2026-01-01T00:00:00.000Z",
		updatedAt: "2026-01-02T00:00:00.000Z",
		createdBy: {
			id: "usr_1",
			name: "Luna",
			image: null,
			email: "luna@example.com",
		},
		event: "api_key.retrieved",
		...over,
	};
}

function secretFixture(over: Partial<ApiKeyWithSecret> = {}): ApiKeyWithSecret {
	return {
		object: "api_key",
		id: "key_123",
		name: "Production",
		key: SECRET,
		enabled: true,
		permissions: null,
		createdAt: "2026-01-01T00:00:00.000Z",
		updatedAt: "2026-01-02T00:00:00.000Z",
		event: "api_key.created",
		...over,
	};
}

function harness(routes: Route[]) {
	const mock = mockReloop(routes);
	const handler = createHttpHandler({
		config: testConfig(),
		logger: silentLogger(),
		fetch: mock.fetch,
	});
	return { calls: mock.calls, handler };
}

function onlyCall(calls: RecordedCall[]): RecordedCall {
	expect(calls).toHaveLength(1);
	const call = calls[0];
	if (call === undefined) {
		throw new Error("expected one upstream call");
	}
	return call;
}

async function call(routes: Route[], name: string, args: object) {
	const { calls, handler } = harness(routes);
	const { client, close } = await connectHttpClient(handler);
	const result = await client.callTool({ name, arguments: { ...args } });
	await close();
	await handler.close();
	return { calls, result };
}

describe("list_api_keys", () => {
	test("forwards filters and maps keys without secrets", async () => {
		const { calls, result } = await call(
			[
				{
					method: "GET",
					path: "/api/api-key/v1/",
					body: {
						object: "api_key",
						apiKeys: [apiKeyFixture()],
						total: 3,
						page: 1,
						limit: 1,
						event: "api_key.listed",
					},
				},
			],
			"list_api_keys",
			{ limit: 1, search: "prod", enabled: true },
		);
		expect(onlyCall(calls).query).toEqual({
			page: "1",
			limit: "1",
			q: "prod",
			enabled: "true",
		});
		const data = structuredContent(result);
		expect(readProperty(data, "pagination")).toEqual({
			page: 1,
			limit: 1,
			total: 3,
			hasMore: true,
		});
		const apiKeys = readProperty(data, "apiKeys");
		if (!Array.isArray(apiKeys)) {
			throw new Error("expected apiKeys");
		}
		expect(apiKeys[0]).toEqual({
			id: "key_123",
			name: "Production",
			start: "rl_prod_ab",
			enabled: true,
			permissions: null,
			requestCount: 42,
			lastUsedAt: "2026-02-01T00:00:00.000Z",
			expiresAt: null,
			createdBy: { id: "usr_1", name: "Luna", email: "luna@example.com" },
			createdAt: "2026-01-01T00:00:00.000Z",
			updatedAt: "2026-01-02T00:00:00.000Z",
		});
	});
});

describe("get_api_key", () => {
	test("maps a missing creator to null", async () => {
		const { calls, result } = await call(
			[
				{
					method: "GET",
					path: "/api/api-key/v1/key_123",
					body: apiKeyFixture({ createdBy: undefined }),
				},
			],
			"get_api_key",
			{ id: "key_123" },
		);
		expect(onlyCall(calls).method).toBe("GET");
		expect(
			readProperty(
				readProperty(structuredContent(result), "apiKey"),
				"createdBy",
			),
		).toBeNull();
	});

	test("maps 404 to api_key_not_found", async () => {
		const { result } = await call(
			[
				{
					method: "GET",
					path: "/api/api-key/v1/key_missing",
					status: 404,
					body: { message: "API key not found" },
				},
			],
			"get_api_key",
			{ id: "key_missing" },
		);
		expect(readProperty(errorJson(result), "code")).toBe("api_key_not_found");
	});
});

describe("create_api_key", () => {
	test("posts the name and returns the one-time secret", async () => {
		const { calls, result } = await call(
			[
				{
					method: "POST",
					path: "/api/api-key/v1/",
					status: 201,
					body: secretFixture(),
				},
			],
			"create_api_key",
			{ name: "  Production  " },
		);
		expect(onlyCall(calls).body).toEqual({ name: "Production" });
		expect(structuredContent(result)).toEqual({
			apiKey: {
				id: "key_123",
				name: "Production",
				key: SECRET,
				enabled: true,
				createdAt: "2026-01-01T00:00:00.000Z",
				updatedAt: "2026-01-02T00:00:00.000Z",
			},
		});
	});

	test("rejects an empty name without calling Reloop", async () => {
		const { calls, result } = await call([], "create_api_key", { name: " " });
		expect(readProperty(result, "isError")).toBe(true);
		expect(calls).toHaveLength(0);
	});

	test("is not retryable after a timeout", async () => {
		const timeoutHandler = createHttpHandler({
			config: testConfig({ timeoutMs: 50 }),
			logger: silentLogger(),
			fetch: mockReloop([
				{ method: "POST", path: "/api/api-key/v1/", delayMs: 500 },
			]).fetch,
		});
		const { client, close } = await connectHttpClient(timeoutHandler);
		const result = await client.callTool({
			name: "create_api_key",
			arguments: { name: "Production" },
		});
		const error = errorJson(result);
		expect(readProperty(error, "code")).toBe("timeout");
		expect(readProperty(error, "retryable")).toBe(false);
		await close();
		await timeoutHandler.close();
	});
});

describe("api key state changes", () => {
	test("update_api_key patches the name", async () => {
		const { calls } = await call(
			[
				{
					method: "PATCH",
					path: "/api/api-key/v1/key_123",
					body: apiKeyFixture({ name: "Staging" }),
				},
			],
			"update_api_key",
			{ id: "key_123", name: "Staging" },
		);
		expect(onlyCall(calls).body).toEqual({ name: "Staging" });
	});

	test("rotate_api_key returns the new secret", async () => {
		const { calls, result } = await call(
			[
				{
					method: "POST",
					path: "/api/api-key/v1/rotate/key_123",
					body: secretFixture({ event: "api_key.rotated" }),
				},
			],
			"rotate_api_key",
			{ id: "key_123" },
		);
		expect(onlyCall(calls).body).toBeUndefined();
		expect(
			readProperty(readProperty(structuredContent(result), "apiKey"), "key"),
		).toBe(SECRET);
	});

	test("enable_api_key and disable_api_key hit their routes", async () => {
		const enabled = await call(
			[
				{
					method: "POST",
					path: "/api/api-key/v1/enable/key_123",
					body: apiKeyFixture(),
				},
			],
			"enable_api_key",
			{ id: "key_123" },
		);
		expect(onlyCall(enabled.calls).path).toBe("/api/api-key/v1/enable/key_123");
		const disabled = await call(
			[
				{
					method: "POST",
					path: "/api/api-key/v1/disable/key_123",
					body: apiKeyFixture({ enabled: false }),
				},
			],
			"disable_api_key",
			{ id: "key_123" },
		);
		expect(
			readProperty(
				readProperty(structuredContent(disabled.result), "apiKey"),
				"enabled",
			),
		).toBe(false);
	});

	test("delete_api_key confirms the deleted id", async () => {
		const { calls, result } = await call(
			[
				{
					method: "DELETE",
					path: "/api/api-key/v1/key_123",
					body: {
						object: "api_key",
						id: "key_123",
						message: "API key deleted successfully",
						event: "api_key.deleted",
					},
				},
			],
			"delete_api_key",
			{ id: "key_123" },
		);
		expect(onlyCall(calls).method).toBe("DELETE");
		expect(structuredContent(result)).toEqual({ deleted: true, id: "key_123" });
	});
});
