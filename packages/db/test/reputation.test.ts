import { describe, expect, test } from "bun:test";
import {
	blockTtlSeconds,
	evaluateReputation,
	reputationRates,
} from "../src/reputation";

describe("reputationRates", () => {
	test("computes bounce and complaint rates", () => {
		expect(reputationRates({ sent: 1000, bounced: 50, complaint: 3 })).toEqual({
			bounceRate: 0.05,
			complaintRate: 0.003,
		});
	});

	test("returns zero rates when nothing sent", () => {
		expect(reputationRates({ sent: 0, bounced: 0, complaint: 0 })).toEqual({
			bounceRate: 0,
			complaintRate: 0,
		});
	});
});

describe("evaluateReputation", () => {
	test("ignores low-volume senders below the floor", () => {
		// 1 bounce out of 2 = 50% but n < 100 → never block.
		const verdict = evaluateReputation({ sent: 2, bounced: 1, complaint: 0 });
		expect(verdict.blocked).toBe(false);
		expect(verdict.warned).toBe(false);
	});

	test("blocks on complaint rate >= 0.3%", () => {
		const verdict = evaluateReputation({
			sent: 1000,
			bounced: 10,
			complaint: 3,
		});
		expect(verdict.blocked).toBe(true);
		expect(verdict.reason).toBe("complaint_rate");
	});

	test("blocks on bounce rate >= 5%", () => {
		const verdict = evaluateReputation({
			sent: 1000,
			bounced: 60,
			complaint: 0,
		});
		expect(verdict.blocked).toBe(true);
		expect(verdict.reason).toBe("bounce_rate");
	});

	test("warns without blocking in the amber zone", () => {
		const verdict = evaluateReputation({
			sent: 1000,
			bounced: 35,
			complaint: 1,
		});
		expect(verdict.blocked).toBe(false);
		expect(verdict.warned).toBe(true);
		expect(verdict.reason).toBe("complaint_rate");
	});

	test("healthy sender is neither warned nor blocked", () => {
		const verdict = evaluateReputation({
			sent: 1000,
			bounced: 5,
			complaint: 0,
		});
		expect(verdict.blocked).toBe(false);
		expect(verdict.warned).toBe(false);
	});
});

describe("blockTtlSeconds", () => {
	test("escalates 1h → 24h → 7d", () => {
		expect(blockTtlSeconds(0)).toBe(3600);
		expect(blockTtlSeconds(1)).toBe(86400);
		expect(blockTtlSeconds(2)).toBe(7 * 86400);
		expect(blockTtlSeconds(5)).toBe(7 * 86400);
	});
});
