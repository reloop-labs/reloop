/**
 * Campaign send is a sequential batch workflow, not a fan-out.
 *
 * Mail `/send` caps a user at 50/min and an org at 100/min. Dumping every
 * recipient (or every batch) onto the queue at once races those windows and
 * 429s. One batch runs, then the next is delayed by a full window.
 */
export const CAMPAIGN_BATCH_SIZE = 40;
export const CAMPAIGN_BATCH_DELAY_MS = 60_000;
export const CAMPAIGN_RATE_LIMIT_FALLBACK_SECONDS = 60;
/**
 * Out of credits or over the plan's daily cap (402). Retry on a slow poll so
 * the campaign resumes on its own after a top-up, an upgrade or the daily
 * reset, instead of stalling with pending recipients forever.
 */
export const CAMPAIGN_QUOTA_RETRY_DELAY_MS = 15 * 60_000;

export function parseRetryAfter(
	value: string | null | undefined,
): number | undefined {
	if (!value) return undefined;
	const trimmed = value.trim();
	if (!trimmed) return undefined;

	const seconds = Number(trimmed);
	if (Number.isFinite(seconds) && seconds >= 0) {
		return Math.ceil(seconds);
	}

	const date = Date.parse(trimmed);
	if (Number.isNaN(date)) return undefined;
	return Math.max(0, Math.ceil((date - Date.now()) / 1000));
}

export function nextBatchDelayMs(params: {
	rateLimited?: boolean;
	quotaExceeded?: boolean;
	retryAfterSeconds?: number;
}): number {
	if (params.quotaExceeded) return CAMPAIGN_QUOTA_RETRY_DELAY_MS;
	if (params.rateLimited) {
		const retryMs =
			(params.retryAfterSeconds ?? CAMPAIGN_RATE_LIMIT_FALLBACK_SECONDS) * 1000;
		return Math.max(retryMs, CAMPAIGN_BATCH_DELAY_MS);
	}
	return CAMPAIGN_BATCH_DELAY_MS;
}
