import { describe, expect, test } from "bun:test";
import {
	type OrgRiskFacts,
	riskLevel,
	scoreOrgRisk,
} from "@reloop/admin/lib/spam-risk";

const now = new Date("2026-10-16T12:00:00Z");
const hoursAgo = (n: number) => new Date(now.getTime() - n * 3_600_000);

function facts(overrides: Partial<OrgRiskFacts> = {}): OrgRiskFacts {
	return {
		createdAt: hoursAgo(24 * 365),
		status: "active",
		isSuspect: false,
		sent7d: 0,
		bounced7d: 0,
		complaints7d: 0,
		sent24h: 0,
		activeSendingBlock: false,
		pastSendingBlocks: 0,
		domainsAdded24h: 0,
		domains: [],
		...overrides,
	};
}

describe("scoreOrgRisk", () => {
	test("an established, clean sender is low risk", () => {
		const r = scoreOrgRisk(
			facts({ sent7d: 10_000, bounced7d: 50, complaints7d: 2, sent24h: 1500 }),
			now,
		);
		expect(r.score).toBe(0);
		expect(r.level).toBe("low");
	});

	test("rates are ignored below the minimum volume", () => {
		const r = scoreOrgRisk(
			facts({ sent7d: 5, bounced7d: 3, complaints7d: 1 }),
			now,
		);
		expect(r.signals.map((s) => s.id)).not.toContain("bounce_rate_high");
	});

	test("a new org with high complaints and a look-alike domain is critical", () => {
		const r = scoreOrgRisk(
			facts({
				createdAt: hoursAgo(5),
				sent7d: 1000,
				bounced7d: 80,
				complaints7d: 5,
				sent24h: 1000,
				domains: [
					{
						domain: "paypa1-login.xyz",
						signals: [
							{ id: "brand_lookalike", points: 40, detail: "imitates paypal" },
							{ id: "domain_age_lt_7d", points: 20, detail: "2 days" },
						],
					},
				],
			}),
			now,
		);
		expect(r.level).toBe("critical");
		expect(r.score).toBe(100);
		expect(r.signals[0]?.id).toBe("brand_lookalike");
		expect(r.signals[0]?.domain).toBe("paypa1-login.xyz");
	});

	test("the same domain signal counts once across many domains", () => {
		const fresh = { id: "domain_age_lt_7d", points: 20, detail: "new" };
		const r = scoreOrgRisk(
			facts({
				domains: Array.from({ length: 6 }, (_, i) => ({
					domain: `d${i}.com`,
					signals: [fresh],
				})),
			}),
			now,
		);
		expect(r.signals.filter((s) => s.id === "domain_age_lt_7d")).toHaveLength(
			1,
		);
		expect(r.score).toBe(20);
	});

	test("volume spike needs both volume and a jump over the trailing average", () => {
		const spike = scoreOrgRisk(facts({ sent7d: 3100, sent24h: 3000 }), now);
		expect(spike.signals.map((s) => s.id)).toContain("volume_spike");
		const steady = scoreOrgRisk(facts({ sent7d: 7000, sent24h: 1000 }), now);
		expect(steady.signals.map((s) => s.id)).not.toContain("volume_spike");
	});
});

describe("riskLevel", () => {
	test("thresholds", () => {
		expect(riskLevel(0)).toBe("low");
		expect(riskLevel(20)).toBe("medium");
		expect(riskLevel(45)).toBe("high");
		expect(riskLevel(70)).toBe("critical");
	});
});
