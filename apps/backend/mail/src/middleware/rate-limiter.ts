import { RateLimitErrors } from "@reloop/be-mail/lib/errors";
import { mailConfig } from "@reloop/be-mail/mail.config";
import { redis } from "@reloop/be-mail/utils/loader";

// ── Types ──────────────────────────────────────────────────────────
interface RateLimitLayer {
	/** Human-readable name for error messages (e.g. "IP", "organization") */
	name: string;
	/** Redis key (fully qualified, including prefix) */
	key: string;
	/** Maximum requests allowed in the window */
	max: number;
	/** Window duration in seconds */
	windowSeconds: number;
}

// ── Helpers ────────────────────────────────────────────────────────

/**
 * Extract the client IP address from the request headers.
 * Checks standard proxy headers first, then falls back to a default.
 */
function getClientIp(headers: Headers): string {
	// Prefer headers set by reverse proxies / load balancers
	const forwarded = headers.get("x-forwarded-for");
	if (forwarded) {
		// x-forwarded-for can be a comma-separated list; the leftmost is the client
		const first = forwarded.split(",")[0]?.trim();
		if (first) return first;
	}

	const realIp = headers.get("x-real-ip");
	if (realIp) return realIp.trim();

	const cfIp = headers.get("cf-connecting-ip");
	if (cfIp) return cfIp.trim();

	// Fallback — should not happen behind a proxy, but covers local dev
	return "unknown";
}

/**
 * Check a single rate limit layer using Redis INCR + EXPIRE.
 * Returns the current count and TTL remaining.
 *
 * The pattern is:
 *   INCR key          → returns the new count
 *   If count === 1    → EXPIRE key windowSeconds  (first request in window, set TTL)
 *   TTL key           → how many seconds remain
 *
 * This is safe even without MULTI/EXEC because:
 * - INCR on a non-existent key initializes it to 1 and returns 1
 * - We only set EXPIRE when count === 1 (the key was just created)
 * - Even if EXPIRE fails, the key will eventually be evicted by Redis maxmemory policy
 */
async function checkLayer(
	layer: RateLimitLayer,
): Promise<{ count: number; ttl: number }> {
	const count = await redis.increment(layer.key);

	// First request in the window — start the clock
	if (count === 1) {
		await redis.expire(layer.key, layer.windowSeconds);
	}

	// Get remaining TTL (returns -1 if no expiry, -2 if key doesn't exist)
	const ttl = await redis.ttl(layer.key);
	const effectiveTtl = ttl > 0 ? ttl : layer.windowSeconds;

	return { count, ttl: effectiveTtl };
}

// ── Exported function ──────────────────────────────────────────────

/**
 * Multi-layer rate limiter for the send-email endpoint.
 *
 * Call this inside a `beforeHandle` hook after auth has resolved
 * `activeOrganizationId` and `userId`.
 *
 * Checks 5 layers in parallel and fails fast on the first exceeded layer.
 *
 * **Fail-open**: If Redis is unreachable, the request is allowed through
 * so email sending isn't blocked by a cache outage.
 *
 * @returns Headers to set on the response (always includes rate limit info).
 */
export async function checkRateLimit({
	headers,
	activeOrganizationId,
	userId,
	log,
}: {
	headers: Headers;
	activeOrganizationId: string;
	userId?: string;
	log: {
		warn: (msg: string, meta?: Record<string, unknown>) => void;
		error: (msg: string, meta?: Record<string, unknown>) => void;
	};
}): Promise<Record<string, string>> {
	const responseHeaders: Record<string, string> = {};

	try {
		const ip = getClientIp(headers);

		// Build the layer definitions
		const layers: RateLimitLayer[] = [
			{
				name: "IP",
				key: `rl:send:ip:${ip}`,
				max: mailConfig.RATE_LIMIT_IP_MAX,
				windowSeconds: mailConfig.RATE_LIMIT_IP_WINDOW_SECONDS,
			},
			{
				name: "organization",
				key: `rl:send:org:${activeOrganizationId}`,
				max: mailConfig.RATE_LIMIT_ORG_MAX,
				windowSeconds: mailConfig.RATE_LIMIT_ORG_WINDOW_SECONDS,
			},
			{
				name: "organization-daily",
				key: `rl:send:org-day:${activeOrganizationId}`,
				max: mailConfig.RATE_LIMIT_ORG_DAILY_MAX,
				windowSeconds: 86400, // 24 hours
			},
			{
				name: "global",
				key: "rl:send:global",
				max: mailConfig.RATE_LIMIT_GLOBAL_MAX,
				windowSeconds: mailConfig.RATE_LIMIT_GLOBAL_WINDOW_SECONDS,
			},
		];

		// Per-user layer only when we have a real user (session/API key auth)
		if (userId) {
			layers.splice(3, 0, {
				name: "user",
				key: `rl:send:user:${userId}`,
				max: mailConfig.RATE_LIMIT_USER_MAX,
				windowSeconds: mailConfig.RATE_LIMIT_USER_WINDOW_SECONDS,
			});
		}

		// Check all layers in parallel for efficiency
		const results = await Promise.all(
			layers.map(async (layer) => {
				const { count, ttl } = await checkLayer(layer);
				return { layer, count, ttl };
			}),
		);

		// Find the most restrictive result (highest usage ratio)
		let worstRatio = 0;
		let tightestResult = results[0]!;

		for (const result of results) {
			const ratio = result.count / result.layer.max;
			if (ratio > worstRatio) {
				worstRatio = ratio;
				tightestResult = result;
			}
		}

		const remaining = Math.max(
			0,
			tightestResult.layer.max - tightestResult.count,
		);
		const resetEpoch = Math.floor(Date.now() / 1000) + tightestResult.ttl;

		// Always set rate limit headers (RFC draft-ietf-httpapi-ratelimit-headers)
		responseHeaders["X-RateLimit-Limit"] = String(tightestResult.layer.max);
		responseHeaders["X-RateLimit-Remaining"] = String(remaining);
		responseHeaders["X-RateLimit-Reset"] = String(resetEpoch);

		// Check if any layer was exceeded
		for (const result of results) {
			if (result.count > result.layer.max) {
				const retryAfter = result.ttl;

				responseHeaders["Retry-After"] = String(retryAfter);
				responseHeaders["X-RateLimit-Limit"] = String(result.layer.max);
				responseHeaders["X-RateLimit-Remaining"] = "0";
				responseHeaders["X-RateLimit-Reset"] = String(
					Math.floor(Date.now() / 1000) + retryAfter,
				);

				log.warn("Rate limit exceeded", {
					layer: result.layer.name,
					key: result.layer.key,
					count: result.count,
					max: result.layer.max,
					retryAfter,
					ip,
					organizationId: activeOrganizationId,
					userId,
				});

				throw RateLimitErrors.rateLimitExceeded(result.layer.name, retryAfter);
			}
		}
	} catch (error) {
		// If it's our own rate limit error, re-throw it
		if (
			error instanceof Error &&
			"status" in error &&
			(error as { status: number }).status === 429
		) {
			throw error;
		}

		// Redis failure — fail open so email sending isn't blocked
		log.error("Rate limiter Redis error — failing open", {
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
		});
	}

	return responseHeaders;
}
