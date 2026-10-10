import { describe, expect, test } from "bun:test";
import {
	ReloopError,
	reloopErrorFromResponse,
	toReloopError,
} from "../src/errors/reloop-error";
import { API_KEY } from "./helpers";

function build(
	status: number,
	body: unknown,
	headers: Record<string, string> = {},
	idempotent = true,
) {
	return reloopErrorFromResponse({
		status,
		body,
		headers: new Headers(headers),
		idempotent,
	});
}

describe("reloopErrorFromResponse", () => {
	test("maps 400 with field errors", () => {
		const error = build(400, {
			message: "Invalid body",
			why: "email is malformed",
			fix: "Send a valid address",
			errors: [{ field: "email", message: "must be an email" }],
		});
		expect(error.code).toBe("validation_error");
		expect(error.why).toBe("email is malformed");
		expect(error.fields).toEqual([
			{ field: "email", message: "must be an email" },
		]);
		expect(error.retryable).toBe(false);
	});

	test("maps 401 with a fallback fix", () => {
		const error = build(401, {});
		expect(error.code).toBe("unauthorized");
		expect(error.message).toBe("Reloop API returned HTTP 401.");
		expect(error.fix).toContain("API key");
	});

	test("maps 402 and 403", () => {
		expect(build(402, {}).code).toBe("quota_exceeded");
		expect(build(403, {}).code).toBe("forbidden");
	});

	test("maps 404 and 409, honouring a code override", () => {
		expect(build(404, {}).code).toBe("not_found");
		expect(build(409, {}).code).toBe("conflict");
		const overridden = reloopErrorFromResponse({
			status: 404,
			body: { message: "Contact not found" },
			headers: new Headers(),
			codes: { 404: "contact_not_found" },
			idempotent: true,
		});
		expect(overridden.code).toBe("contact_not_found");
		expect(overridden.message).toBe("Contact not found");
	});

	test("maps 422 to validation_error", () => {
		expect(build(422, {}).code).toBe("validation_error");
	});

	test("maps 429 from the retry-after header", () => {
		const error = build(429, {}, { "retry-after": "30" });
		expect(error.code).toBe("rate_limited");
		expect(error.retryable).toBe(true);
		expect(error.retryAfterSeconds).toBe(30);
	});

	test("falls back to the body retryAfter", () => {
		expect(build(429, { retryAfter: 12 }).retryAfterSeconds).toBe(12);
	});

	test("maps 500 with retryability following idempotency", () => {
		expect(build(500, {}, {}, true).retryable).toBe(true);
		expect(build(500, {}, {}, false).retryable).toBe(false);
		expect(build(500, {}).code).toBe("upstream_error");
		expect(build(503, {}, {}, false).fix).toContain("Verify the current state");
	});

	test("maps an unmapped 4xx to api_error", () => {
		expect(build(418, {}).code).toBe("api_error");
	});
});

describe("ReloopError", () => {
	test("toJSON omits undefined keys", () => {
		const error = new ReloopError({
			code: "internal_error",
			message: "boom",
			retryable: false,
		});
		expect(error.toJSON()).toEqual({
			code: "internal_error",
			message: "boom",
			retryable: false,
		});
	});
});

describe("toReloopError", () => {
	test("passes a ReloopError through", () => {
		const error = new ReloopError({
			code: "timeout",
			message: "slow",
			retryable: true,
		});
		expect(toReloopError(error)).toBe(error);
	});

	test("wraps a plain Error and redacts it", () => {
		const wrapped = toReloopError(new Error(`failed with ${API_KEY}`));
		expect(wrapped.code).toBe("internal_error");
		expect(wrapped.retryable).toBe(false);
		expect(wrapped.message).not.toContain(API_KEY);
	});
});

describe("upstream link handling", () => {
	test("drops a non-http link", () => {
		expect(
			build(404, { message: "x", link: "javascript:alert(1)" }).link,
		).toBeUndefined();
		expect(
			build(404, { message: "x", link: "https://reloop.sh/docs" }).link,
		).toBe("https://reloop.sh/docs");
	});
});
