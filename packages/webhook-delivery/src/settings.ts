import { WEBHOOK_MAX_ATTEMPTS } from "./constants";

/** Stored on webhook.filtering_options (and accepted by update API). */
export type WebhookFilteringOptions = {
	/** Top-level keys to strip from envelope.data before delivery. */
	excludeFields?: string[];
	/**
	 * Deliver only when every listed key equals the expected value
	 * (shallow equality on envelope.data).
	 */
	matchConditions?: Record<string, unknown>;
};

/**
 * Resolve total BullMQ attempts for a webhook.
 * `maxRetries` is treated as total attempts (including the first try), clamped to 1..WEBHOOK_MAX_ATTEMPTS.
 */
export function resolveWebhookMaxAttempts(
	maxRetries: number | null | undefined,
): number {
	if (typeof maxRetries !== "number" || !Number.isFinite(maxRetries)) {
		return WEBHOOK_MAX_ATTEMPTS;
	}
	const n = Math.floor(maxRetries);
	return Math.min(WEBHOOK_MAX_ATTEMPTS, Math.max(1, n));
}

/** True when data satisfies matchConditions (or there are none). */
export function matchesWebhookFilters(
	data: Record<string, unknown>,
	options: WebhookFilteringOptions | null | undefined,
): boolean {
	const conditions = options?.matchConditions;
	if (!conditions) return true;
	const entries = Object.entries(conditions);
	if (entries.length === 0) return true;
	for (const [key, expected] of entries) {
		if (data[key] !== expected) return false;
	}
	return true;
}

/** Return a shallow copy of data with excludeFields removed. */
export function applyWebhookFilters(
	data: Record<string, unknown>,
	options: WebhookFilteringOptions | null | undefined,
): Record<string, unknown> {
	const exclude = options?.excludeFields;
	if (!exclude || exclude.length === 0) return data;
	const out: Record<string, unknown> = { ...data };
	for (const field of exclude) {
		if (field in out) delete out[field];
	}
	return out;
}

/**
 * Whether an outbound request would exceed the per-minute cap.
 * `count` is the value after incrementing for this request.
 */
export function isWebhookRateLimited(
	count: number,
	maxRequestsPerMinute: number | null | undefined,
): boolean {
	const max =
		typeof maxRequestsPerMinute === "number" &&
		Number.isFinite(maxRequestsPerMinute) &&
		maxRequestsPerMinute > 0
			? Math.floor(maxRequestsPerMinute)
			: 60;
	return count > max;
}

/** Milliseconds to delay when rate limited (based on Redis TTL of the window key). */
export function rateLimitDelayMs(ttlSeconds: number): number {
	if (!Number.isFinite(ttlSeconds) || ttlSeconds <= 0) {
		return 60_000;
	}
	return Math.max(1_000, Math.ceil(ttlSeconds) * 1_000);
}
