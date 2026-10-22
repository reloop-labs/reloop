import { describe, expect, test } from "bun:test";
import {
	blockTtlSeconds,
	evaluateReputation,
	reputationNoticeLevel,
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

describe("reputationNoticeLevel", () => {
	const at = (bounced: number, complaint = 0) =>
		reputationNoticeLevel({ sent: 1000, bounced, complaint });

	test("no notice below the warn rate or the volume floor", () => {
		expect(at(29)).toBe(0);
		expect(reputationNoticeLevel({ sent: 50, bounced: 20, complaint: 0 })).toBe(
			0,
		);
	});

	test("escalates through three levels between warn and block", () => {
		expect(at(30)).toBe(1);
		expect(at(36)).toBe(1);
		expect(at(37)).toBe(2);
		expect(at(43)).toBe(2);
		expect(at(44)).toBe(3);
		expect(at(49)).toBe(3);
	});

	test("no notice once blocked — the pause email covers it", () => {
		expect(at(50)).toBe(0);
	});

	test("takes the worse of bounce and complaint", () => {
		expect(at(30, 2)).toBe(2);
	});
});
