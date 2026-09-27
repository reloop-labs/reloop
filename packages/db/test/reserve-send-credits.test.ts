import { describe, expect, test } from "bun:test";
import {
	applyCreditReservation,
	type CreditSnapshot,
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
