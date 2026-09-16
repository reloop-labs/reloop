import { describe, expect, test } from "bun:test";
import {
	domainDailyOverlay,
	isRegistrationAgeStale,
	mergeDailyLimits,
	NEW_DOMAIN_COLD_DAILY_CAP,
	NEW_DOMAIN_TOO_NEW_DAILY_CAP,
	REGISTRATION_AGE_STALE_MS,
} from "../src/domain-daily-overlay";
import {
	applyCreditReservation,
	type CreditSnapshot,
	utcDayStart,
} from "../src/reserve-send-credits";

const now = new Date("2026-09-16T10:00:00.000Z");

function snapshot(overrides: Partial<CreditSnapshot> = {}): CreditSnapshot {
	return {
		creditsRemaining: 3000,
		creditsUsed: 0,
		monthlyCredits: 3000,
		currentPeriodEnd: new Date("2026-10-15T18:38:00.000Z"),
		dailyEmailsUsed: 0,
		dailyWindowStart: utcDayStart(now),
		...overrides,
	};
}

function daysAgo(days: number): Date {
	return new Date(now.getTime() - days * 86_400_000);
}

describe("domainDailyOverlay", () => {
	test("free + unknown age is treated as too new (10/day)", () => {
		expect(
			domainDailyOverlay({ registeredAt: null, planId: "free", now }),
		).toBe(NEW_DOMAIN_TOO_NEW_DAILY_CAP);
		expect(domainDailyOverlay({ registeredAt: null, planId: null, now })).toBe(
			NEW_DOMAIN_TOO_NEW_DAILY_CAP,
		);
	});

	test("paid + unknown age does not add an overlay", () => {
		expect(
			domainDailyOverlay({
				registeredAt: null,
				planId: "individual",
				now,
			}),
		).toBeNull();
	});

	test("age of 7 days or less is 10/day on any plan", () => {
		expect(
			domainDailyOverlay({
				registeredAt: daysAgo(0),
				planId: "startup",
				now,
			}),
		).toBe(10);
		expect(
			domainDailyOverlay({
				registeredAt: daysAgo(7),
				planId: "free",
				now,
			}),
		).toBe(10);
	});

	test("age of 8-30 days is 25/day", () => {
		expect(
			domainDailyOverlay({
				registeredAt: daysAgo(8),
				planId: "free",
				now,
			}),
		).toBe(NEW_DOMAIN_COLD_DAILY_CAP);
		expect(
			domainDailyOverlay({
				registeredAt: daysAgo(30),
				planId: "individual",
				now,
			}),
		).toBe(25);
	});

	test("age over 30 days uses the plan cap only", () => {
		expect(
			domainDailyOverlay({
				registeredAt: daysAgo(40),
				planId: "free",
				now,
			}),
		).toBeNull();
		expect(
			domainDailyOverlay({
				registeredAt: daysAgo(40),
				planId: "individual",
				now,
			}),
		).toBeNull();
	});
});

describe("mergeDailyLimits", () => {
	test("overlay wins when the plan has no daily cap", () => {
		expect(mergeDailyLimits(null, 10)).toBe(10);
	});

	test("the tighter of plan and overlay binds", () => {
		expect(mergeDailyLimits(100, 10)).toBe(10);
		expect(mergeDailyLimits(100, 25)).toBe(25);
		expect(mergeDailyLimits(5, 10)).toBe(5);
	});
});

describe("isRegistrationAgeStale", () => {
	test("missing check is stale", () => {
		expect(isRegistrationAgeStale(null, now)).toBe(true);
	});

	test("a check older than 7 days is stale", () => {
		expect(
			isRegistrationAgeStale(
				new Date(now.getTime() - REGISTRATION_AGE_STALE_MS),
				now,
			),
		).toBe(true);
	});

	test("a recent check is fresh", () => {
		expect(isRegistrationAgeStale(new Date(now.getTime() - 60_000), now)).toBe(
			false,
		);
	});
});

describe("new-domain overlay with applyCreditReservation", () => {
	test("a 10/day overlay stops the 11th email on a free new domain", () => {
		const dailyEmailLimit = mergeDailyLimits(
			100,
			domainDailyOverlay({
				registeredAt: daysAgo(2),
				planId: "free",
				now,
			}),
		);
		let credits = snapshot();
		let accepted = 0;
		for (let i = 0; i < 50; i++) {
			const decision = applyCreditReservation({
				credits,
				dailyEmailLimit,
				recipientCount: 1,
				now,
			});
			if (decision.ok) {
				credits = decision.next;
				accepted += 1;
			}
		}
		expect(dailyEmailLimit).toBe(10);
		expect(accepted).toBe(10);
	});

	test("a 25/day overlay stops there on a 20-day-old domain", () => {
		const dailyEmailLimit = mergeDailyLimits(
			100,
			domainDailyOverlay({
				registeredAt: daysAgo(20),
				planId: "free",
				now,
			}),
		);
		let credits = snapshot();
		let accepted = 0;
		for (let i = 0; i < 40; i++) {
			const decision = applyCreditReservation({
				credits,
				dailyEmailLimit,
				recipientCount: 1,
				now,
			});
			if (decision.ok) {
				credits = decision.next;
				accepted += 1;
			}
		}
		expect(dailyEmailLimit).toBe(25);
		expect(accepted).toBe(25);
	});

	test("paid + 40-day-old domain has no overlay so plan daily is null", () => {
		const overlay = domainDailyOverlay({
			registeredAt: daysAgo(40),
			planId: "individual",
			now,
		});
		expect(mergeDailyLimits(null, overlay)).toBeNull();
	});
});
