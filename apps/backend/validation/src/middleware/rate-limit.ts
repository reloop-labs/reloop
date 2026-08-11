import { withDeadline } from "@be/validation/utils/deadline";
import { redis } from "@be/validation/utils/loader";
import { validationConfig } from "@be/validation/validation.config";
import {
	applyResponseHeaders,
	buildRateLimitHeaders,
} from "@reloop/auth/middleware";
import { Elysia } from "elysia";
import { log } from "evlog";

const { rateLimitMax, rateLimitWindowSeconds } = validationConfig.constants;

const REDIS_DEADLINE_MS = 250;

// Caddy appends the direct peer, so the left-most entry is the client. It is
// spoofable — an abuse speed bump on a free public tool, not an auth boundary.
function clientIp(headers: Headers, fallback: string | undefined): string {
	const forwarded = headers.get("x-forwarded-for");
	if (forwarded) {
		const first = forwarded.split(",")[0]?.trim();
		if (first) return first;
	}
	return headers.get("x-real-ip")?.trim() || fallback || "unknown";
}

async function consumeBudget(
	key: string,
): Promise<{ count: number; ttl: number }> {
	const count = await redis.increment(key);
	if (count === 1) await redis.expire(key, rateLimitWindowSeconds);
	const ttl = await redis.ttl(key);
	return { count, ttl };
}

async function checkRateLimit(ip: string): Promise<{
	limited: boolean;
	remaining: number;
	retryAfter: number;
}> {
	const key = `rate-limit:check:${ip}`;

	try {
		const { count, ttl } = await withDeadline(
			consumeBudget(key),
			REDIS_DEADLINE_MS,
			"Rate limiter Redis",
		);

		if (count > rateLimitMax) {
			return {
				limited: true,
				remaining: 0,
				retryAfter: Math.max(ttl, 1),
			};
		}

		return {
			limited: false,
			remaining: Math.max(0, rateLimitMax - count),
			retryAfter: ttl > 0 ? ttl : rateLimitWindowSeconds,
		};
	} catch (err) {
		log.error({
			error: err instanceof Error ? err.message : String(err),
			message: "Rate limiter Redis error — failing open",
		});
		return {
			limited: false,
			remaining: rateLimitMax,
			retryAfter: rateLimitWindowSeconds,
		};
	}
}

export const rateLimitPlugin = new Elysia({
	name: "rate-limit-validation",
}).macro({
	rateLimit: {
		async resolve({ status, set, request, server }) {
			const ip = clientIp(request.headers, server?.requestIP(request)?.address);
			const result = await checkRateLimit(ip);

			applyResponseHeaders(
				set.headers as Record<string, string>,
				buildRateLimitHeaders({
					limit: rateLimitMax,
					remaining: result.remaining,
					resetSeconds: result.retryAfter || rateLimitWindowSeconds,
					retryAfter: result.limited ? result.retryAfter : undefined,
				}),
			);

			if (result.limited) {
				return status(429, {
					message: "Too many requests",
					why: `This endpoint allows ${rateLimitMax} checks per ${rateLimitWindowSeconds}s from one IP address.`,
					fix: `Wait ${result.retryAfter} second(s) before retrying.`,
				});
			}
		},
	},
});
