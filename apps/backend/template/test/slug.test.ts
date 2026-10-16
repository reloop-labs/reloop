import { describe, expect, test } from "bun:test";
import {
	isGeneratedSlugFor,
	isValidTemplateSlug,
	toTemplateSlug,
} from "../src/utils/slug";

describe("toTemplateSlug", () => {
	test("lowercases and dash-joins words", () => {
		expect(toTemplateSlug("Welcome Email")).toBe("welcome-email");
		expect(toTemplateSlug("  Order  Confirmation!! ")).toBe(
			"order-confirmation",
		);
	});

	test("strips accents and symbols", () => {
		expect(toTemplateSlug("Café Ünïcode 🎉 Promo")).toBe("cafe-unicode-promo");
	});

	test("falls back when nothing is left", () => {
		expect(toTemplateSlug("🎉🎉")).toBe("template");
		expect(toTemplateSlug("")).toBe("template");
	});

	test("leaves room for a suffix and never ends in a dash", () => {
		const slug = toTemplateSlug(`${"a".repeat(119)} b`);
		expect(slug.length).toBeLessThanOrEqual(120);
		expect(slug.endsWith("-")).toBe(false);
		expect(isValidTemplateSlug(`${slug}-99`)).toBe(true);
	});

	test("always produces a valid slug", () => {
		for (const name of ["Welcome Email", "--x--", "A_B.C", "Untitled (Copy)"]) {
			expect(isValidTemplateSlug(toTemplateSlug(name))).toBe(true);
		}
	});
});

describe("isValidTemplateSlug", () => {
	test("rejects uppercase, underscores, and stray dashes", () => {
		expect(isValidTemplateSlug("welcome-email")).toBe(true);
		expect(isValidTemplateSlug("Welcome")).toBe(false);
		expect(isValidTemplateSlug("welcome_email")).toBe(false);
		expect(isValidTemplateSlug("-welcome")).toBe(false);
		expect(isValidTemplateSlug("welcome--email")).toBe(false);
		expect(isValidTemplateSlug("a".repeat(129))).toBe(false);
	});
});

describe("isGeneratedSlugFor", () => {
	test("matches the base slug and numbered variants", () => {
		expect(isGeneratedSlugFor("untitled", "Untitled")).toBe(true);
		expect(isGeneratedSlugFor("untitled-7", "Untitled")).toBe(true);
	});

	test("does not match a hand-picked slug", () => {
		expect(isGeneratedSlugFor("onboarding", "Untitled")).toBe(false);
		expect(isGeneratedSlugFor("untitled-v2", "Untitled")).toBe(false);
	});
});
