import { describe, expect, it } from "vitest";
import { normalizeEmail } from "./normalize-email";

describe("normalizeEmail", () => {
	it("lowercases the whole address, domain included", () => {
		expect(normalizeEmail("Steve@Apple.COM")).toBe("steve@apple.com");
	});

	it("trims surrounding whitespace", () => {
		expect(normalizeEmail("  steve@apple.com ")).toBe("steve@apple.com");
	});
});
