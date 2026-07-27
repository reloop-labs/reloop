/**
 * Standard rate-limit + Reloop quota response headers.
 * Aligned with Resend-style public API headers (lowercase ratelimit-*).
 *
 * @see https://resend.com/docs/api-reference/rate-limit
 */

export type RateLimitHeaderInput = {
	/** Maximum requests allowed in the window. */
	limit: number;
	/** Requests remaining in the current window. */
	remaining: number;
	/**
	 * Seconds until the window resets (Resend semantics).
	 * Not a unix epoch — a relative countdown.
	 */
	resetSeconds: number;
	/** Seconds to wait before retrying (set when limited / 429). */
	retryAfter?: number;
};

export type ReloopQuotaHeaderInput = {
	/** Used daily email/send quota (integer count). */
	dailyUsed?: number | null;
	/** Used monthly email/send quota (integer count). */
	monthlyUsed?: number | null;
};

/** Canonical Reloop / Resend-compatible rate limit header names. */
export const RATE_LIMIT_HEADER = {
	limit: "ratelimit-limit",
	remaining: "ratelimit-remaining",
	reset: "ratelimit-reset",
	retryAfter: "retry-after",
} as const;

/** Reloop email-sending quota usage headers (used counts). */
export const RELOOP_QUOTA_HEADER = {
	daily: "x-reloop-daily-quota",
	monthly: "x-reloop-monthly-quota",
} as const;

/**
 * Build rate-limit response headers.
 * Always includes limit / remaining / reset; retry-after only when provided.
 */
export function buildRateLimitHeaders(
	input: RateLimitHeaderInput,
): Record<string, string> {
	const resetSeconds = Math.max(0, Math.floor(input.resetSeconds));
	const remaining = Math.max(0, Math.floor(input.remaining));
	const limit = Math.max(0, Math.floor(input.limit));

	const headers: Record<string, string> = {
		[RATE_LIMIT_HEADER.limit]: String(limit),
		[RATE_LIMIT_HEADER.remaining]: String(remaining),
		[RATE_LIMIT_HEADER.reset]: String(resetSeconds),
		// Legacy aliases (still useful for some clients / proxies)
		"X-RateLimit-Limit": String(limit),
		"X-RateLimit-Remaining": String(remaining),
		"X-RateLimit-Reset": String(resetSeconds),
	};

	if (input.retryAfter != null && input.retryAfter > 0) {
		const retry = Math.max(1, Math.floor(input.retryAfter));
		headers[RATE_LIMIT_HEADER.retryAfter] = String(retry);
		headers["Retry-After"] = String(retry);
	}

	return headers;
}

/** Build Reloop quota usage headers (omit keys when value is null/undefined). */
export function buildReloopQuotaHeaders(
	input: ReloopQuotaHeaderInput,
): Record<string, string> {
	const headers: Record<string, string> = {};
	if (input.dailyUsed != null && Number.isFinite(input.dailyUsed)) {
		headers[RELOOP_QUOTA_HEADER.daily] = String(
			Math.max(0, Math.floor(input.dailyUsed)),
		);
	}
	if (input.monthlyUsed != null && Number.isFinite(input.monthlyUsed)) {
		headers[RELOOP_QUOTA_HEADER.monthly] = String(
			Math.max(0, Math.floor(input.monthlyUsed)),
		);
	}
	return headers;
}

/** Apply a header map onto an Elysia `set.headers` bag. */
export function applyResponseHeaders(
	setHeaders: Record<string, string | number | undefined | null>,
	headers: Record<string, string>,
): void {
	for (const [key, value] of Object.entries(headers)) {
		setHeaders[key] = value;
	}
}
