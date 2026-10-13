/**
 * Billing-period date math. All UTC, so results don't depend on the server
 * timezone, and month lengths are clamped (Jan 31 + 1 month = Feb 28/29).
 */

/** Add `months` calendar months in UTC, clamping to the last day of the target month. */
export function addMonthsUtc(from: Date, months: number): Date {
	const year = from.getUTCFullYear();
	const month = from.getUTCMonth() + months;
	const targetYear = year + Math.floor(month / 12);
	const targetMonth = ((month % 12) + 12) % 12;
	const lastDay = new Date(
		Date.UTC(targetYear, targetMonth + 1, 0),
	).getUTCDate();
	return new Date(
		Date.UTC(
			targetYear,
			targetMonth,
			Math.min(from.getUTCDate(), lastDay),
			from.getUTCHours(),
			from.getUTCMinutes(),
			from.getUTCSeconds(),
			from.getUTCMilliseconds(),
		),
	);
}

/**
 * Roll an expired period forward from its own anchor (not from "now"), so a
 * late first send doesn't shift every later period. Skips whole months that
 * passed without activity. Months are counted from `anchor` so a 31st anchor
 * keeps landing on month-ends instead of decaying to the 28th.
 */
export function advancePeriod(args: {
	periodStart: Date;
	periodEnd: Date;
	now: Date;
}): { periodStart: Date; periodEnd: Date } {
	const anchor = args.periodStart;
	let start = args.periodStart;
	let end = args.periodEnd;
	let months = 1;
	while (end <= args.now) {
		start = end;
		months += 1;
		end = addMonthsUtc(anchor, months);
		if (end <= start) end = addMonthsUtc(start, 1);
	}
	return { periodStart: start, periodEnd: end };
}

/** Included vs used for a closed period; overage is whatever went past the plan. */
export function periodOverage(includedEmails: number, emailsUsed: number) {
	return Math.max(0, emailsUsed - includedEmails);
}
