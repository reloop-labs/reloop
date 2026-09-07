import { describe, expect, test } from "bun:test";
import {
	applyPlanChange,
	closePeriodSnapshot,
	getPlanLimits,
	isCheckoutPlanId,
	mapPolarSubscriptionStatus,
} from "@reloop/pricing";

describe("plan catalog", () => {
	test("matches hosted pricing numbers", () => {
		expect(getPlanLimits("free")).toMatchObject({
			monthlyEmails: 3000,
			dailyEmailLimit: 200,
			overageEnabled: false,
			maxAgentInboxes: 1,
			maxWebhooks: 1,
			dedicatedIpCount: 0,
		});
		expect(getPlanLimits("individual")).toMatchObject({
			monthlyEmails: 50_000,
			dailyEmailLimit: null,
			overageEnabled: true,
			maxAgentInboxes: 5,
			maxWebhooks: 5,
		});
		expect(getPlanLimits("startup")).toMatchObject({
			monthlyEmails: 100_000,
			dedicatedIpCount: 1,
			maxAgentInboxes: 10,
		});
	});

	test("only Individual and Startup are checkout plans", () => {
		expect(isCheckoutPlanId("individual")).toBe(true);
		expect(isCheckoutPlanId("startup")).toBe(true);
		expect(isCheckoutPlanId("free")).toBe(false);
		expect(isCheckoutPlanId("enterprise")).toBe(false);
	});
});

describe("applyPlanChange", () => {
	test("copies catalog on first assign", () => {
		const next = applyPlanChange({ current: null, nextPlanId: "individual" });
		expect(next.planId).toBe("individual");
		expect(next.monthlyEmails).toBe(50_000);
		expect(next.maxWebhooks).toBe(5);
	});

	test("keeps gifted extras when the org upgrades", () => {
		const current = {
			...getPlanLimits("individual"),
			maxWebhooks: 8,
			maxAgentInboxes: 7,
		};
		const next = applyPlanChange({ current, nextPlanId: "startup" });
		expect(next.planId).toBe("startup");
		expect(next.monthlyEmails).toBe(100_000);
		expect(next.maxWebhooks).toBe(10);
		expect(next.maxAgentInboxes).toBe(10);
	});

	test("keeps extras above the new catalog", () => {
		const current = {
			...getPlanLimits("individual"),
			maxWebhooks: 20,
			monthlyEmails: 80_000,
		};
		const next = applyPlanChange({ current, nextPlanId: "startup" });
		expect(next.maxWebhooks).toBe(20);
		expect(next.monthlyEmails).toBe(100_000);
	});

	test("does not invent extras when the org was on catalog numbers", () => {
		const next = applyPlanChange({
			current: getPlanLimits("individual"),
			nextPlanId: "free",
		});
		expect(next.maxWebhooks).toBe(1);
		expect(next.monthlyEmails).toBe(3000);
	});
});

describe("closePeriodSnapshot", () => {
	test("unused included emails do not roll over", () => {
		const closed = closePeriodSnapshot({
			includedEmails: 50_000,
			emailsUsed: 12_000,
		});
		expect(closed.unusedEmails).toBe(38_000);
		expect(closed.emailsOverage).toBe(0);
		expect(closed.emailsUsed).toBe(12_000);
	});

	test("records overage above included", () => {
		const closed = closePeriodSnapshot({
			includedEmails: 50_000,
			emailsUsed: 52_500,
		});
		expect(closed.emailsOverage).toBe(2_500);
		expect(closed.unusedEmails).toBe(0);
	});
});

describe("mapPolarSubscriptionStatus", () => {
	test("maps Polar canceled to Reloop cancelled", () => {
		expect(mapPolarSubscriptionStatus("canceled")).toBe("cancelled");
		expect(mapPolarSubscriptionStatus("past_due")).toBe("past_due");
		expect(mapPolarSubscriptionStatus("active")).toBe("active");
	});
});
