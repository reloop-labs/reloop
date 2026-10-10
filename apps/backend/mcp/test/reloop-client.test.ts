import { describe, expect, test } from "bun:test";
import { ReloopError } from "../src/errors/reloop-error";
import { MAX_RESPONSE_BODY_BYTES, ReloopClient } from "../src/reloop/client";
import { USER_AGENT } from "../src/version";
import {
	API_KEY,
	BASE_URL,
	capturingLogger,
	mockReloop,
	type Route,
} from "./helpers";

function client(routes: Route[], over: { timeoutMs?: number } = {}) {
	const mock = mockReloop(routes);
	return {
		mock,
		client: new ReloopClient({
			baseUrl: BASE_URL,
			apiKey: API_KEY,
			fetch: mock.fetch,
			timeoutMs: over.timeoutMs ?? 5000,
		}),
	};
}

async function expectReloopError(
	promise: Promise<unknown>,
): Promise<ReloopError> {
	try {
		await promise;
	} catch (cause) {
		expect(cause).toBeInstanceOf(ReloopError);
		if (cause instanceof ReloopError) {
			return cause;
		}
	}
	throw new Error("expected a ReloopError");
}

describe("ReloopClient", () => {
	test("sends auth, accept and user-agent headers", async () => {
		const { mock, client: reloop } = client([
			{ method: "GET", path: "/api/contacts/list", body: {} },
		]);
		await reloop.request({
			method: "GET",
			path: "/api/contacts/list",
			idempotent: true,
		});
		const call = mock.calls[0];
		expect(call?.headers["x-api-key"]).toBe(API_KEY);
		expect(call?.headers["user-agent"]).toBe(USER_AGENT);
		expect(call?.headers.accept).toBe("application/json");
		expect(call?.headers["content-type"]).toBeUndefined();
	});

	test("sets content-type only for requests with a body", async () => {
		const { mock, client: reloop } = client([
			{ method: "POST", path: "/api/contacts/create", status: 201, body: {} },
		]);
		await reloop.request({
			method: "POST",
			path: "/api/contacts/create",
			body: { email: "luna@example.com" },
			idempotent: false,
		});
		expect(mock.calls[0]?.headers["content-type"]).toBe("application/json");
		expect(mock.calls[0]?.body).toEqual({ email: "luna@example.com" });
	});

	test("drops undefined query parameters", async () => {
		const { mock, client: reloop } = client([
			{ method: "GET", path: "/api/contacts/list", body: {} },
		]);
		await reloop.request({
			method: "GET",
			path: "/api/contacts/list",
			query: { page: 2, limit: undefined, search: "luna" },
			idempotent: true,
		});
		expect(mock.calls[0]?.query).toEqual({ page: "2", search: "luna" });
	});

	test("maps an error body with a code override", async () => {
		const { client: reloop } = client([
			{
				method: "GET",
				path: "/api/contacts/retrieve/con_1",
				status: 404,
				body: {
					message: "Contact not found",
					why: "No such id",
					fix: "Check the id",
				},
			},
		]);
		const error = await expectReloopError(
			reloop.request({
				method: "GET",
				path: "/api/contacts/retrieve/con_1",
				codes: { 404: "contact_not_found" },
				idempotent: true,
			}),
		);
		expect(error.code).toBe("contact_not_found");
		expect(error.message).toBe("Contact not found");
		expect(error.why).toBe("No such id");
		expect(error.fix).toBe("Check the id");
	});

	test("maps a rate limit with retry-after", async () => {
		const { client: reloop } = client([
			{
				method: "GET",
				path: "/api/contacts/list",
				status: 429,
				body: { message: "Too many requests", retryAfter: 30 },
				headers: { "retry-after": "30" },
			},
		]);
		const error = await expectReloopError(
			reloop.request({
				method: "GET",
				path: "/api/contacts/list",
				idempotent: true,
			}),
		);
		expect(error.code).toBe("rate_limited");
		expect(error.retryable).toBe(true);
		expect(error.retryAfterSeconds).toBe(30);
	});

	test("marks a 5xx retryable only when idempotent", async () => {
		const routes: Route[] = [
			{
				method: "GET",
				path: "/api/contacts/list",
				status: 500,
				body: { message: "boom" },
			},
			{
				method: "POST",
				path: "/api/contacts/create",
				status: 500,
				body: { message: "boom" },
			},
		];
		const { client: reloop } = client(routes);
		const read = await expectReloopError(
			reloop.request({
				method: "GET",
				path: "/api/contacts/list",
				idempotent: true,
			}),
		);
		expect(read.code).toBe("upstream_error");
		expect(read.retryable).toBe(true);
		const write = await expectReloopError(
			reloop.request({
				method: "POST",
				path: "/api/contacts/create",
				body: {},
				idempotent: false,
			}),
		);
		expect(write.retryable).toBe(false);
	});

	test("maps a transport failure to network_error", async () => {
		const { client: reloop } = client([
			{ method: "GET", path: "/api/contacts/list", error: "fetch failed" },
			{ method: "POST", path: "/api/contacts/create", error: "fetch failed" },
		]);
		const read = await expectReloopError(
			reloop.request({
				method: "GET",
				path: "/api/contacts/list",
				idempotent: true,
			}),
		);
		expect(read.code).toBe("network_error");
		expect(read.retryable).toBe(true);
		const write = await expectReloopError(
			reloop.request({
				method: "POST",
				path: "/api/contacts/create",
				body: {},
				idempotent: false,
			}),
		);
		expect(write.retryable).toBe(false);
	});

	test("maps a slow response to timeout", async () => {
		const { client: reloop } = client(
			[{ method: "GET", path: "/api/contacts/list", body: {}, delayMs: 200 }],
			{ timeoutMs: 20 },
		);
		const error = await expectReloopError(
			reloop.request({
				method: "GET",
				path: "/api/contacts/list",
				idempotent: true,
			}),
		);
		expect(error.code).toBe("timeout");
		expect(error.retryable).toBe(true);
	});

	test("maps a slow response body to timeout", async () => {
		const { client: reloop } = client(
			[
				{
					method: "GET",
					path: "/api/contacts/list",
					body: {},
					bodyDelayMs: 200,
				},
			],
			{ timeoutMs: 20 },
		);
		const error = await expectReloopError(
			reloop.request({
				method: "GET",
				path: "/api/contacts/list",
				idempotent: true,
			}),
		);
		expect(error.code).toBe("timeout");
	});

	test("maps a non-JSON success body to malformed_response", async () => {
		const { client: reloop } = client([
			{
				method: "GET",
				path: "/api/contacts/list",
				rawBody: "<html>login</html>",
			},
		]);
		const error = await expectReloopError(
			reloop.request({
				method: "GET",
				path: "/api/contacts/list",
				idempotent: true,
			}),
		);
		expect(error.code).toBe("malformed_response");
	});

	test("returns undefined for 204", async () => {
		const { client: reloop } = client([
			{ method: "DELETE", path: "/api/contacts/con_1", status: 204 },
		]);
		const result = await reloop.request({
			method: "DELETE",
			path: "/api/contacts/con_1",
			idempotent: true,
		});
		expect(result).toBeUndefined();
	});

	test("never logs the API key", async () => {
		const { logger, lines } = capturingLogger();
		const mock = mockReloop([
			{ method: "GET", path: "/api/contacts/list", body: {} },
		]);
		const reloop = new ReloopClient({
			baseUrl: BASE_URL,
			apiKey: API_KEY,
			fetch: mock.fetch,
			logger,
		});
		await reloop.request({
			method: "GET",
			path: "/api/contacts/list",
			query: { search: "luna" },
			idempotent: true,
		});
		expect(lines.length).toBeGreaterThan(0);
		for (const line of lines) {
			expect(line).not.toContain(API_KEY);
		}
	});
});

describe("ReloopClient hardening", () => {
	test("scrubs the live key from a transport failure message", async () => {
		const { client: reloop } = client([
			{
				method: "GET",
				path: "/api/contacts/list",
				error: `proxy rejected x-api-key raw ${API_KEY} value`,
			},
		]);
		const error = await expectReloopError(
			reloop.request({
				method: "GET",
				path: "/api/contacts/list",
				idempotent: true,
			}),
		);
		expect(error.code).toBe("network_error");
		expect(JSON.stringify(error.toJSON())).not.toContain(API_KEY);
	});

	test("rejects an upstream body larger than the limit", async () => {
		const { client: reloop } = client([
			{
				method: "GET",
				path: "/api/contacts/list",
				rawBody: `{"contacts":"${"x".repeat(MAX_RESPONSE_BODY_BYTES + 1)}"}`,
			},
		]);
		const error = await expectReloopError(
			reloop.request({
				method: "GET",
				path: "/api/contacts/list",
				idempotent: true,
			}),
		);
		expect(error.code).toBe("malformed_response");
	});
});
