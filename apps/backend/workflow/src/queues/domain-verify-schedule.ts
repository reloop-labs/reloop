/** BullMQ custom backoff type for domain DNS verification. */
export const DOMAIN_VERIFY_BACKOFF_TYPE = "domain-verify";

/** Number of DNS check attempts before marking the domain failed. */
export const DOMAIN_VERIFY_ATTEMPTS = 7;

/** Delay before the first DNS check (T+1 minute). */
export const DOMAIN_VERIFY_INITIAL_DELAY_MS = 60_000;

/**
 * Backoff delays after failed attempts 1–6, chosen so checks land at
 * absolute times from verify start: 1m, 3m, 5m, 10m, 20m, 40m, 1h.
 *
 * Index 0 = delay after attempt 1, index 5 = delay after attempt 6.
 */
export const DOMAIN_VERIFY_BACKOFF_DELAYS_MS = [
	2 * 60_000, // after T+1m → T+3m
	2 * 60_000, // after T+3m → T+5m
	5 * 60_000, // after T+5m → T+10m
	10 * 60_000, // after T+10m → T+20m
	20 * 60_000, // after T+20m → T+40m
	20 * 60_000, // after T+40m → T+1h
] as const;

export function getDomainVerifyBackoffDelay(attemptsMade: number): number {
	const index = attemptsMade - 1;
	if (index < 0 || index >= DOMAIN_VERIFY_BACKOFF_DELAYS_MS.length) {
		return 0;
	}
	return DOMAIN_VERIFY_BACKOFF_DELAYS_MS[index];
}
