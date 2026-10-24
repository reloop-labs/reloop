import { describe, expect, test } from "bun:test";
import {
	applyCreditReservation,
	applyReceiveCharge,
	type CreditSnapshot,
	usablePrepaidCredits,
	utcDayStart,
} from "../src/reserve-send-credits";

function snapshot(overrides: Partial<CreditSnapshot> = {}): CreditSnapshot {
	const now = new Date("2026-09-16T10:00:00.000Z");
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

describe("applyCreditReservation", () => {
	const now = new Date("2026-09-16T10:00:00.000Z");

	test("unlimited never denies and leaves remaining untouched", () => {
		const decision = applyCreditReservation({
			credits: snapshot({ creditsRemaining: 0 }),
			dailyEmailLimit: null,
			recipientCount: 500,
			now,
			unlimited: true,
		});
		expect(decision.ok).toBe(true);
		if (!decision.ok) return;
		expect(decision.remaining).toBe(0);
		expect(decision.next.creditsRemaining).toBe(0);
		expect(decision.next.creditsUsed).toBe(500);
		expect(decision.next.dailyEmailsUsed).toBe(500);
	});

	test("daily cap of 100 blocks the 101st email on a free plan", () => {
		let credits = snapshot();
		let accepted = 0;
		let dailyDenied = 0;

		for (let i = 0; i < 8000; i++) {
			const decision = applyCreditReservation({
				credits,
				dailyEmailLimit: 100,
				recipientCount: 1,
				now,
			});
			if (decision.ok) {
				credits = decision.next;
				accepted += 1;
			} else if (decision.reason === "daily") {
				dailyDenied += 1;
			}
		}

		expect(accepted).toBe(100);
		expect(dailyDenied).toBe(7900);
		expect(credits.creditsUsed).toBe(100);
		expect(credits.creditsRemaining).toBe(2900);
		expect(credits.dailyEmailsUsed).toBe(100);
	});

	test("monthly cap of 3000 binds when there is no daily limit", () => {
		let credits = snapshot();
		let accepted = 0;
		let monthlyDenied = 0;

		for (let i = 0; i < 5000; i++) {
			const decision = applyCreditReservation({
				credits,
				dailyEmailLimit: null,
				recipientCount: 1,
				now,
			});
			if (decision.ok) {
				credits = decision.next;
				accepted += 1;
			} else if (decision.reason === "monthly") {
				monthlyDenied += 1;
			}
		}

		expect(accepted).toBe(3000);
		expect(monthlyDenied).toBe(2000);
		expect(credits.creditsRemaining).toBe(0);
	});

	test("a multi-recipient send is rejected when it would cross the daily cap", () => {
		const credits = snapshot({ dailyEmailsUsed: 99 });
		const decision = applyCreditReservation({
			credits,
			dailyEmailLimit: 100,
			recipientCount: 2,
			now,
		});
		expect(decision.ok).toBe(false);
		if (!decision.ok) {
			expect(decision.reason).toBe("daily");
			expect(decision.dailyUsed).toBe(99);
			expect(decision.dailyLimit).toBe(100);
		}
	});

	test("daily usage resets at the next UTC day", () => {
		const credits = snapshot({
			dailyEmailsUsed: 100,
			dailyWindowStart: utcDayStart(new Date("2026-09-15T10:00:00.000Z")),
		});
		const decision = applyCreditReservation({
			credits,
			dailyEmailLimit: 100,
			recipientCount: 1,
			now,
		});
		expect(decision.ok).toBe(true);
		if (decision.ok) {
			expect(decision.dailyUsed).toBe(1);
			expect(decision.next.dailyEmailsUsed).toBe(1);
		}
	});

	test("monthly remaining is checked before the daily cap", () => {
		const credits = snapshot({ creditsRemaining: 0, creditsUsed: 3000 });
		const decision = applyCreditReservation({
			credits,
			dailyEmailLimit: 100,
			recipientCount: 1,
			now,
		});
		expect(decision.ok).toBe(false);
		if (!decision.ok) expect(decision.reason).toBe("monthly");
	});
});

describe("applyReceiveCharge", () => {
	test("a received email uses one credit from the shared monthly pool", () => {
		expect(
			applyReceiveCharge({ creditsUsed: 10, creditsRemaining: 2990 }),
		).toEqual({
			creditsUsed: 11,
			creditsRemaining: 2989,
			delta: -1,
			fromPrepaid: 0,
		});
	});

	test("receiving never goes below zero but still counts toward overage", () => {
		expect(
			applyReceiveCharge({ creditsUsed: 3000, creditsRemaining: 0 }),
		).toEqual({
			creditsUsed: 3001,
			creditsRemaining: 0,
			delta: 0,
			fromPrepaid: 0,
		});
	});

	test("self-hosted tracks usage without drawing down the balance", () => {
		expect(
			applyReceiveCharge({
				creditsUsed: 5,
				creditsRemaining: 100,
				unlimited: true,
			}),
		).toEqual({
			creditsUsed: 6,
			creditsRemaining: 100,
			delta: 0,
			fromPrepaid: 0,
		});
	});

	test("received mail that drains the pool blocks the next send", () => {
		const now = new Date("2026-09-16T10:00:00.000Z");
		const afterReceive = applyReceiveCharge({
			creditsUsed: 2999,
			creditsRemaining: 1,
		});
		const decision = applyCreditReservation({
			credits: snapshot({
				creditsUsed: afterReceive.creditsUsed,
				creditsRemaining: afterReceive.creditsRemaining,
			}),
			dailyEmailLimit: null,
			recipientCount: 1,
			now,
		});
		expect(decision.ok).toBe(false);
		if (decision.ok) return;
		expect(decision.reason).toBe("monthly");
	});
});

describe("prepaid credits", () => {
	const now = new Date("2026-09-16T10:00:00.000Z");

	test("monthly emails are spent first, then prepaid credits", () => {
		const decision = applyCreditReservation({
			credits: snapshot({ creditsRemaining: 10, prepaidRemaining: 1000 }),
			dailyEmailLimit: null,
			recipientCount: 25,
			now,
		});
		expect(decision.ok).toBe(true);
		if (!decision.ok) return;
		expect(decision.fromPrepaid).toBe(15);
		expect(decision.next.creditsRemaining).toBe(0);
		expect(decision.next.prepaidRemaining).toBe(985);
		expect(decision.remaining).toBe(985);
	});

	test("prepaid credits let a send through once the monthly pool is empty", () => {
		const decision = applyCreditReservation({
			credits: snapshot({
				creditsRemaining: 0,
				creditsUsed: 3000,
				prepaidRemaining: 5,
			}),
			dailyEmailLimit: null,
			recipientCount: 5,
			now,
		});
		expect(decision.ok).toBe(true);
		if (!decision.ok) return;
		expect(decision.fromPrepaid).toBe(5);
		expect(decision.next.prepaidRemaining).toBe(0);
	});

	test("a send larger than monthly plus prepaid is denied", () => {
		const decision = applyCreditReservation({
			credits: snapshot({ creditsRemaining: 2, prepaidRemaining: 3 }),
			dailyEmailLimit: null,
			recipientCount: 6,
			now,
		});
		expect(decision.ok).toBe(false);
		if (decision.ok) return;
		expect(decision.reason).toBe("monthly");
		expect(decision.remaining).toBe(5);
	});

	test("without prepaid credits nothing is drawn from them", () => {
		const decision = applyCreditReservation({
			credits: snapshot(),
			dailyEmailLimit: null,
			recipientCount: 3,
			now,
		});
		expect(decision.ok).toBe(true);
		if (decision.ok) expect(decision.fromPrepaid).toBe(0);
	});

	test("expired or missing expiry means no usable prepaid credits", () => {
		const later = new Date("2026-10-01T00:00:00.000Z");
		const earlier = new Date("2026-09-01T00:00:00.000Z");
		expect(
			usablePrepaidCredits(
				{ prepaidCredits: 50, prepaidExpiresAt: later },
				now,
			),
		).toBe(50);
		expect(
			usablePrepaidCredits(
				{ prepaidCredits: 50, prepaidExpiresAt: earlier },
				now,
			),
		).toBe(0);
		expect(
			usablePrepaidCredits({ prepaidCredits: 50, prepaidExpiresAt: null }, now),
		).toBe(0);
	});

	test("received mail draws from prepaid once the monthly pool is empty", () => {
		expect(
			applyReceiveCharge({
				creditsUsed: 3000,
				creditsRemaining: 0,
				prepaidRemaining: 10,
			}),
		).toEqual({
			creditsUsed: 3001,
			creditsRemaining: 0,
			delta: -1,
			fromPrepaid: 1,
		});
	});
});
