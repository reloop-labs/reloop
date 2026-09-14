import { describe, expect, test } from "bun:test";
import { resolveInternalBaseUrl } from "@reloop/auth/middleware/internal-base-url";

const PUBLIC = "https://reloop.example.com";
const INTERNAL = "http://auth:8000";

describe("resolveInternalBaseUrl", () => {
	test("falls back to the public base url", () => {
		expect(resolveInternalBaseUrl(PUBLIC, undefined, undefined)).toBe(PUBLIC);
	});

	test("uses the environment override when set", () => {
		expect(resolveInternalBaseUrl(PUBLIC, undefined, INTERNAL)).toBe(INTERNAL);
	});

	test("explicit config beats the environment", () => {
		expect(resolveInternalBaseUrl(PUBLIC, INTERNAL, "http://ignored:1")).toBe(
			INTERNAL,
		);
	});

	test("ignores blank values rather than producing an empty origin", () => {
		for (const blank of ["", "   "]) {
			expect(resolveInternalBaseUrl(PUBLIC, blank, blank)).toBe(PUBLIC);
		}
	});

	test("trims surrounding whitespace", () => {
		expect(resolveInternalBaseUrl(PUBLIC, undefined, `  ${INTERNAL}\n`)).toBe(
			INTERNAL,
		);
	});
});
