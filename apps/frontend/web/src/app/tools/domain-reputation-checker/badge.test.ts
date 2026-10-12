import { describe, expect, test } from "bun:test";
import { normalizeBadgeDomain, renderBadge } from "./badge";

describe("normalizeBadgeDomain", () => {
	test("accepts hostnames with or without .svg", () => {
		expect(normalizeBadgeDomain("Stripe.com")).toBe("stripe.com");
		expect(normalizeBadgeDomain("mail.acme.co.uk.svg")).toBe("mail.acme.co.uk");
	});

	test("rejects anything that isn't a bare hostname", () => {
		for (const bad of [
			"localhost",
			"http://x.com",
			"a..com",
			"x.com/path",
			"<x>.com",
			"",
		]) {
			expect(normalizeBadgeDomain(bad)).toBeNull();
		}
	});
});

describe("renderBadge", () => {
	test("shows grade and score", () => {
		const svg = renderBadge({ grade: "A+", score: 96 });
		expect(svg).toContain("A+ 96");
		expect(svg).toContain('aria-label="domain reputation: A+ 96"');
	});

	test("falls back to a neutral badge", () => {
		expect(renderBadge(null)).toContain(">unknown<");
	});
});
