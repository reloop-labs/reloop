/** BullMQ custom backoff type for domain DNS verification. */
export const DOMAIN_VERIFY_BACKOFF_TYPE = "domain-verify";

/** Delay before the first background check (fast path already tried T+0). */
export const DOMAIN_VERIFY_INITIAL_DELAY_MS = 5_000;

/**
 * Check cadence by phase, measured from when the user clicks verify. Checks
 * hit the zone's authoritative nameservers, so a record is visible seconds
 * after it is saved: poll tightly while the user is likely still on the
 * page, then back off but keep trying for an hour before marking failed.
 */
const DOMAIN_VERIFY_PHASES = [
	{ untilMs: 60_000, everyMs: 10_000 },
	{ untilMs: 5 * 60_000, everyMs: 20_000 },
	{ untilMs: 15 * 60_000, everyMs: 60_000 },
	{ untilMs: 60 * 60_000, everyMs: 5 * 60_000 },
] as const;

/** Absolute check times from verify start: 5s, 15s, 25s … 1h. */
export const DOMAIN_VERIFY_CHECK_TIMES_MS: readonly number[] = (() => {
	const times = [DOMAIN_VERIFY_INITIAL_DELAY_MS];
	for (const phase of DOMAIN_VERIFY_PHASES) {
		let next = (times.at(-1) ?? 0) + phase.everyMs;
		while (next <= phase.untilMs) {
			times.push(next);
			next += phase.everyMs;
		}
	}
	return times;
})();

/** Number of DNS check attempts before marking the domain failed. */
export const DOMAIN_VERIFY_ATTEMPTS = DOMAIN_VERIFY_CHECK_TIMES_MS.length;

/** Delay after failed attempt `attemptsMade` (1-based) until the next check. */
export function getDomainVerifyBackoffDelay(attemptsMade: number): number {
	const current = DOMAIN_VERIFY_CHECK_TIMES_MS[attemptsMade - 1];
	const next = DOMAIN_VERIFY_CHECK_TIMES_MS[attemptsMade];
	if (current === undefined || next === undefined) return 0;
	return next - current;
}
