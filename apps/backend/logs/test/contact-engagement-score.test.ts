import { describe, expect, test } from "bun:test";
import { scoreContactEngagement } from "../src/lib/contact-engagement-score";

describe("scoreContactEngagement", () => {
	test("returns New when nothing sent", () => {
		expect(
			scoreContactEngagement({
				total: 0,
				sent: 0,
				delivered: 0,
				opened: 0,
				clicked: 0,
				bounced: 0,
				failed: 0,
				complained: 0,
			}),
		).toEqual({ score: null, rating: "New" });
	});

	test("rewards engaged contacts", () => {
		const { score, rating } = scoreContactEngagement({
			total: 10,
			sent: 10,
			delivered: 10,
			opened: 8,
			clicked: 3,
			bounced: 0,
			failed: 0,
			complained: 0,
		});
		expect(score).toBeGreaterThanOrEqual(60);
		expect(["Good", "Excellent"]).toContain(rating);
	});

	test("punishes unengaged contacts (IP-rep risk)", () => {
		const { score, rating } = scoreContactEngagement({
			total: 10,
			sent: 10,
			delivered: 10,
			opened: 1,
			clicked: 0,
			bounced: 0,
			failed: 0,
			complained: 0,
		});
		expect(score).toBeLessThan(40);
		expect(["At risk", "Poor"]).toContain(rating);
	});

	test("caps score on spam complaint", () => {
		const { score } = scoreContactEngagement({
			total: 10,
			sent: 10,
			delivered: 10,
			opened: 9,
			clicked: 5,
			bounced: 0,
			failed: 0,
			complained: 1,
		});
		expect(score).toBeLessThanOrEqual(40);
	});

	test("shrinks tiny samples toward neutral", () => {
		const one = scoreContactEngagement({
			total: 1,
			sent: 1,
			delivered: 1,
			opened: 1,
			clicked: 0,
			bounced: 0,
			failed: 0,
			complained: 0,
		});
		// Perfect single send would be ~55 raw; shrinkage keeps it near 50s.
		expect(one.score).toBeGreaterThanOrEqual(50);
		expect(one.score).toBeLessThan(70);
	});

	test("bounces drag the score down", () => {
		const clean = scoreContactEngagement({
			total: 5,
			sent: 5,
			delivered: 5,
			opened: 2,
			clicked: 1,
			bounced: 0,
			failed: 0,
			complained: 0,
		});
		const bouncy = scoreContactEngagement({
			total: 5,
			sent: 5,
			delivered: 3,
			opened: 2,
			clicked: 1,
			bounced: 2,
			failed: 0,
			complained: 0,
		});
		expect(bouncy.score).toBeLessThan(clean.score ?? 100);
	});
});
