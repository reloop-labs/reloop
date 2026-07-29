import {
	WEBHOOK_MAX_ATTEMPTS,
	WEBHOOK_RETRY_BACKOFF_TYPE,
} from "./constants";

/**
 * Fixed retry delays (ms) *after* a failed attempt, before the next try.
 * Index 0 = delay before attempt 2, etc.
 *
 * Schedule (from docs):
 * 1 immediate, 2 after 5s, 3 after 5m, 4 after 30m, 5 after 2h, 6 after 5h, 7 after 10h
 */
export const WEBHOOK_RETRY_DELAYS_MS = [
	5_000, // before attempt 2
	5 * 60_000, // before attempt 3
	30 * 60_000, // before attempt 4
	2 * 60 * 60_000, // before attempt 5
	5 * 60 * 60_000, // before attempt 6
	10 * 60 * 60_000, // before attempt 7
] as const;

export function getWebhookRetryDelayMs(attemptsMade: number): number {
	// BullMQ backoffStrategy: attemptsMade is the number of *failed* attempts so far
	// (1 after first failure). Delay before next attempt uses index attemptsMade - 1.
	const idx = Math.max(0, attemptsMade - 1);
	if (idx >= WEBHOOK_RETRY_DELAYS_MS.length) {
		return WEBHOOK_RETRY_DELAYS_MS[WEBHOOK_RETRY_DELAYS_MS.length - 1] ?? 0;
	}
	return WEBHOOK_RETRY_DELAYS_MS[idx] ?? 0;
}

/** BullMQ job options for a new delivery. */
export function webhookDeliveryJobOptions(
	deliveryId: string,
	options?: {
		/** Total attempts including the first (clamped by caller). */
		attempts?: number;
		/** Delay before the first attempt (e.g. outbound rate limit). */
		delayMs?: number;
	},
) {
	const attempts = options?.attempts ?? WEBHOOK_MAX_ATTEMPTS;
	const delayMs = options?.delayMs ?? 0;
	return {
		jobId: deliveryId,
		attempts,
		...(delayMs > 0 ? { delay: delayMs } : {}),
		backoff: {
			type: WEBHOOK_RETRY_BACKOFF_TYPE,
		},
		removeOnComplete: { count: 500 },
		removeOnFail: { count: 1000 },
	} as const;
}

export { WEBHOOK_MAX_ATTEMPTS, WEBHOOK_RETRY_BACKOFF_TYPE };
