import { describe, expect, test } from "bun:test";
import { DEFAULT_APP_NAME, resolveAppName } from "@reloop/brand";

describe("resolveAppName", () => {
	test("uses the configured name", () => {
		expect(resolveAppName("Acme Mail")).toBe("Acme Mail");
	});

	test("trims surrounding whitespace", () => {
		expect(resolveAppName("  Acme Mail \n")).toBe("Acme Mail");
	});

	test("falls back when unset or blank", () => {
		for (const value of [undefined, "", "   "]) {
			expect(resolveAppName(value)).toBe(DEFAULT_APP_NAME);
		}
	});
});
