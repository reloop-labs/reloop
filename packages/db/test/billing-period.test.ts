import { describe, expect, it } from "bun:test";
import {
	addMonthsUtc,
	advancePeriod,
	periodOverage,
} from "../src/billing-period";
import { isPastDueBeyondGrace } from "../src/reserve-send-credits";

const iso = (d: Date) => d.toISOString();

describe("addMonthsUtc", () => {
	it("clamps month-end anchors instead of overflowing", () => {
		expect(iso(addMonthsUtc(new Date("2027-01-31T10:00:00Z"), 1))).toBe(
			"2027-02-28T10:00:00.000Z",
		);
		expect(iso(addMonthsUtc(new Date("2028-01-31T00:00:00Z"), 1))).toBe(
			"2028-02-29T00:00:00.000Z",
		);
	});

	it("rolls over the year", () => {
		expect(iso(addMonthsUtc(new Date("2026-12-15T00:00:00Z"), 1))).toBe(
			"2027-01-15T00:00:00.000Z",
		);
	});
});

describe("advancePeriod", () => {
	it("starts the new period at the old end (no drift from a late first send)", () => {
		const next = advancePeriod({
			periodStart: new Date("2026-09-05T00:00:00Z"),
			periodEnd: new Date("2026-10-05T00:00:00Z"),
			now: new Date("2026-10-15T00:00:00Z"),
		});
		expect(iso(next.periodStart)).toBe("2026-10-05T00:00:00.000Z");
		expect(iso(next.periodEnd)).toBe("2026-11-05T00:00:00.000Z");
	});

	it("skips whole idle months and keeps a 31st anchor on month-ends", () => {
		const next = advancePeriod({
			periodStart: new Date("2026-12-31T00:00:00Z"),
			periodEnd: new Date("2027-01-31T00:00:00Z"),
			now: new Date("2027-03-10T00:00:00Z"),
		});
		expect(iso(next.periodStart)).toBe("2027-02-28T00:00:00.000Z");
		expect(iso(next.periodEnd)).toBe("2027-03-31T00:00:00.000Z");
	});
});

describe("periodOverage", () => {
	it("only counts usage beyond the included amount", () => {
		expect(periodOverage(50000, 49000)).toBe(0);
		expect(periodOverage(50000, 50120)).toBe(120);
	});
});

describe("isPastDueBeyondGrace", () => {
	const now = new Date("2026-10-20T00:00:00Z");
	it("allows sending inside the grace period", () => {
		expect(
			isPastDueBeyondGrace({
				status: "past_due",
				pastDueSince: new Date("2026-10-15T00:00:00Z"),
				now,
				graceDays: 7,
			}),
		).toBe(false);
	});
	it("blocks after the grace period", () => {
		expect(
			isPastDueBeyondGrace({
				status: "past_due",
				pastDueSince: new Date("2026-10-10T00:00:00Z"),
				now,
				graceDays: 7,
			}),
		).toBe(true);
	});
	it("never blocks non past_due statuses", () => {
		expect(
			isPastDueBeyondGrace({
				status: "active",
				pastDueSince: new Date("2020-01-01T00:00:00Z"),
				now,
				graceDays: 7,
			}),
		).toBe(false);
	});
});
