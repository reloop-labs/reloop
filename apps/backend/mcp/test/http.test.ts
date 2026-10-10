import { describe, expect, test } from "bun:test";
import type { Config } from "../src/config/env";
import {
	createHttpHandler,
	type HttpHandler,
	MAX_REQUEST_BODY_BYTES,
} from "../src/transports/http";
import { VERSION } from "../src/version";
import {
	API_KEY,
	capturingLogger,
	mockReloop,
	silentLogger,
	testConfig,
} from "./helpers";

function handlerFor(over: Partial<Config> = {}): HttpHandler {
	return createHttpHandler({
		config: testConfig(over),
		logger: silentLogger(),
		fetch: mockReloop([]).fetch,
	});
}

function mcpRequest(
	headers: Record<string, string>,
	body = '{"jsonrpc":"2.0","id":1,"method":"ping"}',
) {
	return new Request("http://127.0.0.1/mcp", {
		method: "POST",
		headers: {
			host: "127.0.0.1",
			"content-type": "application/json",
			accept: "application/json, text/event-stream",
			...headers,
		},
		body,
	});
}

describe("health endpoint", () => {
	test("reports the server identity with a request id", async () => {
		const handler = handlerFor();
		const response = await handler.fetch(
			new Request("http://127.0.0.1/healthz", {
				headers: { host: "127.0.0.1" },
			}),
		);
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({
			status: "ok",
			name: "reloop",
			version: VERSION,
		});
		expect(response.headers.get("x-request-id")).toBeTruthy();
		await handler.close();
	});

	test("serves the same probe under the mcp base path", async () => {
		const handler = handlerFor();
		const response = await handler.fetch(
			new Request("http://127.0.0.1/mcp/healthz", {
				headers: { host: "127.0.0.1" },
			}),
		);
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({
			status: "ok",
			name: "reloop",
			version: VERSION,
		});
		await handler.close();
	});

	test("echoes a valid incoming request id and replaces an invalid one", async () => {
		const handler = handlerFor();
		const echoed = await handler.fetch(
			new Request("http://127.0.0.1/healthz", {
				headers: { host: "127.0.0.1", "x-request-id": "req_abc-123" },
			}),
		);
		expect(echoed.headers.get("x-request-id")).toBe("req_abc-123");
		const replaced = await handler.fetch(
			new Request("http://127.0.0.1/healthz", {
				headers: { host: "127.0.0.1", "x-request-id": "bad id!" },
			}),
		);
		expect(replaced.headers.get("x-request-id")).not.toBe("bad id!");
		await handler.close();
	});
});

describe("authentication gate", () => {
	test("rejects a request without credentials", async () => {
		const handler = handlerFor();
		const response = await handler.fetch(mcpRequest({}));
		expect(response.status).toBe(401);
		expect(response.headers.get("www-authenticate")?.startsWith("Bearer")).toBe(
			true,
		);
		await handler.close();
	});

	test("accepts an x-api-key header", async () => {
		const handler = handlerFor();
		const response = await handler.fetch(mcpRequest({ "x-api-key": API_KEY }));
		expect(response.status).not.toBe(401);
		await handler.close();
	});

	test("forwards a Better Auth OAuth bearer instead of rejecting it", async () => {
		const handler = handlerFor();
		const jwt = "eyJhbGciOiJFZERTQSJ9.eyJzdWIiOiJ1c2VyLTEifQ.c2lnbmF0dXJl";
		const response = await handler.fetch(
			mcpRequest({ authorization: `Bearer ${jwt}` }),
		);
		expect(response.status).not.toBe(401);
		await handler.close();
	});

	test("challenges unauthenticated clients with resource metadata", async () => {
		const handler = handlerFor();
		const response = await handler.fetch(mcpRequest({}));
		expect(response.status).toBe(401);
		const challenge = response.headers.get("www-authenticate") ?? "";
		expect(challenge.startsWith("Bearer")).toBe(true);
		expect(challenge).toContain("resource_metadata=");
		expect(challenge).toContain(".well-known/oauth-protected-resource");
		await handler.close();
	});

	test("rejects an implausible key", async () => {
		const handler = handlerFor();
		const response = await handler.fetch(mcpRequest({ "x-api-key": "nope" }));
		expect(response.status).toBe(401);
		await handler.close();
	});
});

describe("protected resource metadata", () => {
	test("advertises the resource and authorization server", async () => {
		const handler = handlerFor();
		for (const path of [
			"/.well-known/oauth-protected-resource",
			"/.well-known/oauth-protected-resource/mcp",
		]) {
			const response = await handler.fetch(
				new Request(`http://127.0.0.1${path}`, {
					headers: { host: "127.0.0.1" },
				}),
			);
			expect(response.status).toBe(200);
			const body = (await response.json()) as {
				resource?: string;
				authorization_servers?: string[];
				bearer_methods_supported?: string[];
			};
			expect(body.resource).toBe("http://reloop.test/mcp");
			expect(body.authorization_servers).toEqual([
				"http://reloop.test/api/auth/v1",
			]);
			expect(body.bearer_methods_supported).toEqual(["header"]);
		}
		await handler.close();
	});
});

describe("routing", () => {
	test("returns 404 for another path", async () => {
		const handler = handlerFor();
		const response = await handler.fetch(
			new Request("http://127.0.0.1/other", { headers: { host: "127.0.0.1" } }),
		);
		expect(response.status).toBe(404);
		await handler.close();
	});

	test("rejects a body larger than the limit before reading it", async () => {
		const handler = handlerFor();
		const response = await handler.fetch(
			mcpRequest({
				"x-api-key": API_KEY,
				"content-length": String(MAX_REQUEST_BODY_BYTES + 1),
			}),
		);
		expect(response.status).toBe(413);
		await handler.close();
	});

	test("answers malformed JSON with a 4xx", async () => {
		const handler = handlerFor();
		const response = await handler.fetch(
			mcpRequest({ "x-api-key": API_KEY }, "{not json"),
		);
		expect(response.status).toBeGreaterThanOrEqual(400);
		expect(response.status).toBeLessThan(500);
		await handler.close();
	});
});

describe("origin validation", () => {
	test("rejects an origin outside the allowlist", async () => {
		const handler = handlerFor({ allowedOrigins: ["app.example.com"] });
		const response = await handler.fetch(
			mcpRequest({ "x-api-key": API_KEY, origin: "https://evil.example" }),
		);
		expect(response.status).toBe(403);
		await handler.close();
	});

	test("allows an origin on the allowlist and a missing origin", async () => {
		const handler = handlerFor({ allowedOrigins: ["app.example.com"] });
		const allowed = await handler.fetch(
			mcpRequest({ "x-api-key": API_KEY, origin: "https://app.example.com" }),
		);
		expect(allowed.status).not.toBe(403);
		const absent = await handler.fetch(mcpRequest({ "x-api-key": API_KEY }));
		expect(absent.status).not.toBe(403);
		await handler.close();
	});
});

describe("host validation", () => {
	test("enforces an explicit host allowlist", async () => {
		const handler = handlerFor({
			host: "0.0.0.0",
			allowedHosts: ["mcp.example.com"],
		});
		const allowed = await handler.fetch(
			mcpRequest({ host: "mcp.example.com", "x-api-key": API_KEY }),
		);
		expect(allowed.status).not.toBe(403);
		const rejected = await handler.fetch(
			mcpRequest({ host: "attacker.example", "x-api-key": API_KEY }),
		);
		expect(rejected.status).toBe(403);
		await handler.close();
	});

	test("accepts any host when bound publicly without an allowlist", async () => {
		const handler = handlerFor({ host: "0.0.0.0" });
		const response = await handler.fetch(
			mcpRequest({ host: "anything.example", "x-api-key": API_KEY }),
		);
		expect(response.status).not.toBe(403);
		await handler.close();
	});
});

describe("configuration warnings", () => {
	test("warns that RELOOP_API_KEY is ignored", async () => {
		const { logger, lines } = capturingLogger();
		const handler = createHttpHandler({
			config: testConfig({ apiKey: API_KEY }),
			logger,
			fetch: mockReloop([]).fetch,
		});
		expect(lines.some((line) => line.includes("RELOOP_API_KEY"))).toBe(true);
		for (const line of lines) {
			expect(line).not.toContain(API_KEY);
		}
		await handler.close();
	});
});

describe("request hardening", () => {
	test("rejects a non-numeric content-length", async () => {
		const handler = handlerFor();
		for (const length of ["abc", "1e999", "-1e999"]) {
			const response = await handler.fetch(
				mcpRequest({ "x-api-key": API_KEY, "content-length": length }),
			);
			expect(response.status).toBe(413);
		}
		await handler.close();
	});

	test("treats a bracketed IPv6 loopback bind as loopback", async () => {
		const handler = handlerFor({ host: "[::1]" });
		const rejected = await handler.fetch(
			mcpRequest({ host: "evil.example", "x-api-key": API_KEY }),
		);
		expect(rejected.status).toBe(403);
		await handler.close();
	});

	test("warns when host validation is off", async () => {
		const { logger, lines } = capturingLogger();
		const handler = createHttpHandler({
			config: testConfig({ host: "0.0.0.0" }),
			logger,
			fetch: mockReloop([]).fetch,
		});
		expect(
			lines.some((line) => line.includes("Host header validation is off")),
		).toBe(true);
		await handler.close();
	});
});
