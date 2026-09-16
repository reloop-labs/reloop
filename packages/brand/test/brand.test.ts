import { describe, expect, test } from "bun:test";
import { DEFAULT_APP_NAME, resolveAppName } from "@reloop/brand";

describe("resolveAppName", () => {
	test("attributes a configured name to self-hosted Reloop", () => {
		expect(resolveAppName("Acme Mail")).toBe("Self-hosted Reloop × Acme Mail");
	});

	test("trims surrounding whitespace", () => {
		expect(resolveAppName("  Acme Mail \n")).toBe(
			"Self-hosted Reloop × Acme Mail",
		);
	});

	test("falls back when unset or blank", () => {
		for (const value of [undefined, "", "   "]) {
			expect(resolveAppName(value)).toBe(DEFAULT_APP_NAME);
		}
	});

	test("keeps plain Reloop branding when set to Reloop", () => {
		for (const value of ["Reloop", "reloop", " RELOOP "]) {
			expect(resolveAppName(value)).toBe(DEFAULT_APP_NAME);
		}
	});
});
