/** BullMQ custom backoff type for domain DNS verification. */
export const DOMAIN_VERIFY_BACKOFF_TYPE = "domain-verify";

/** Number of DNS check attempts before marking the domain failed. */
export const DOMAIN_VERIFY_ATTEMPTS = 7;

/** Delay before the first DNS check (T+10s — fast path already tried T+0). */
export const DOMAIN_VERIFY_INITIAL_DELAY_MS = 10_000;

/**
 * Backoff delays after failed attempts 1–6, chosen so checks land at
 * absolute times from verify start: 10s, 30s, 1m, 2.5m, 5.5m, 11.5m, 21.5m.
 *
 * Index 0 = delay after attempt 1, index 5 = delay after attempt 6.
 */
export const DOMAIN_VERIFY_BACKOFF_DELAYS_MS = [
	20_000, // after T+10s → T+30s
	30_000, // after T+30s → T+1m
	90_000, // after T+1m → T+2.5m
	180_000, // after T+2.5m → T+5.5m
	360_000, // after T+5.5m → T+11.5m
	600_000, // after T+11.5m → T+21.5m
] as const;

export function getDomainVerifyBackoffDelay(attemptsMade: number): number {
	const index = attemptsMade - 1;
	if (index < 0 || index >= DOMAIN_VERIFY_BACKOFF_DELAYS_MS.length) {
		return 0;
	}
	return DOMAIN_VERIFY_BACKOFF_DELAYS_MS[index] ?? 0;
}
