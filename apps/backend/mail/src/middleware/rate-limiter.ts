import {
	buildRateLimitHeaders,
	buildReloopQuotaHeaders,
} from "@reloop/auth/middleware";
import { RateLimitErrors } from "@reloop/be-mail/lib/errors";
import { mailConfig } from "@reloop/be-mail/mail.config";
import { redis } from "@reloop/be-mail/utils/loader";
import { db } from "@reloop/db/client";

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
 * Prefer Cloudflare, then trusted proxy headers.
 */
function getClientIp(headers: Headers): string {
	const cfIp = headers.get("cf-connecting-ip");
	if (cfIp) return cfIp.trim();

	const forwarded = headers.get("x-forwarded-for");
	if (forwarded) {
		const first = forwarded.split(",")[0]?.trim();
		if (first) return first;
	}

	const realIp = headers.get("x-real-ip");
	if (realIp) return realIp.trim();

	return "unknown";
}

/**
 * Check a single rate limit layer using Redis INCR + EXPIRE.
 */
async function checkLayer(
	layer: RateLimitLayer,
): Promise<{ count: number; ttl: number }> {
	const count = await redis.increment(layer.key);

	if (count === 1) {
		await redis.expire(layer.key, layer.windowSeconds);
	}

	const ttl = await redis.ttl(layer.key);
	const effectiveTtl = ttl > 0 ? ttl : layer.windowSeconds;

	return { count, ttl: effectiveTtl };
}

async function loadMonthlyUsed(organizationId: string): Promise<number | null> {
	try {
		const row = await db.query.organizationCredits.findFirst({
			where: (c, { and, eq }) =>
				and(eq(c.organizationId, organizationId), eq(c.status, "active")),
			columns: { creditsUsed: true },
		});
		return row?.creditsUsed ?? null;
	} catch {
		return null;
	}
}

/**
 * Multi-layer rate limiter for the send-email endpoint.
 *
 * **Fail-open**: If Redis is unreachable, the request is allowed through
 * so email sending isn't blocked by a cache outage.
 *
 * @returns Headers to set on the response (rate limit + Reloop quotas).
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

	// Quota headers are best-effort and independent of Redis RL success.
	const monthlyUsedPromise = loadMonthlyUsed(activeOrganizationId);

	try {
		const ip = getClientIp(headers);

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
				windowSeconds: 86400,
			},
			{
				name: "global",
				key: "rl:send:global",
				max: mailConfig.RATE_LIMIT_GLOBAL_MAX,
				windowSeconds: mailConfig.RATE_LIMIT_GLOBAL_WINDOW_SECONDS,
			},
		];

		if (userId) {
			layers.splice(3, 0, {
				name: "user",
				key: `rl:send:user:${userId}`,
				max: mailConfig.RATE_LIMIT_USER_MAX,
				windowSeconds: mailConfig.RATE_LIMIT_USER_WINDOW_SECONDS,
			});
		}

		const results = await Promise.all(
			layers.map(async (layer) => {
				const { count, ttl } = await checkLayer(layer);
				return { layer, count, ttl };
			}),
		);

		// Tightest layer by usage ratio drives the primary ratelimit-* headers.
		const first = results[0];
		if (!first) {
			return responseHeaders;
		}
		let worstRatio = 0;
		let tightestResult = first;

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

		Object.assign(
			responseHeaders,
			buildRateLimitHeaders({
				limit: tightestResult.layer.max,
				remaining,
				resetSeconds: tightestResult.ttl,
			}),
		);

		// Daily used quota from the org-day layer counter.
		const dailyLayer = results.find(
			(r) => r.layer.name === "organization-daily",
		);
		const dailyUsed = dailyLayer?.count ?? null;
		const monthlyUsed = await monthlyUsedPromise;

		Object.assign(
			responseHeaders,
			buildReloopQuotaHeaders({
				dailyUsed,
				monthlyUsed,
			}),
		);

		for (const result of results) {
			if (result.count > result.layer.max) {
				const retryAfter = Math.max(result.ttl, 1);

				Object.assign(
					responseHeaders,
					buildRateLimitHeaders({
						limit: result.layer.max,
						remaining: 0,
						resetSeconds: retryAfter,
						retryAfter,
					}),
				);
				Object.assign(
					responseHeaders,
					buildReloopQuotaHeaders({
						dailyUsed,
						monthlyUsed,
					}),
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

				const err = RateLimitErrors.rateLimitExceeded(
					result.layer.name,
					retryAfter,
				) as Error & { rateLimitHeaders?: Record<string, string> };
				err.rateLimitHeaders = { ...responseHeaders };
				throw err;
			}
		}
	} catch (error) {
		if (
			error instanceof Error &&
			"status" in error &&
			(error as { status: number }).status === 429
		) {
			const monthlyUsed = await monthlyUsedPromise;
			if (!responseHeaders["x-reloop-monthly-quota"] && monthlyUsed != null) {
				Object.assign(
					responseHeaders,
					buildReloopQuotaHeaders({ monthlyUsed }),
				);
			}
			const withHeaders = error as Error & {
				rateLimitHeaders?: Record<string, string>;
			};
			withHeaders.rateLimitHeaders = {
				...responseHeaders,
				...withHeaders.rateLimitHeaders,
			};
			throw withHeaders;
		}

		log.error("Rate limiter Redis error — failing open", {
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
		});

		// Still attach monthly quota when RL Redis fails.
		const monthlyUsed = await monthlyUsedPromise;
		Object.assign(responseHeaders, buildReloopQuotaHeaders({ monthlyUsed }));
	}

	return responseHeaders;
}
