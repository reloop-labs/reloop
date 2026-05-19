import { redis } from "@be/contacts/utils/loader";
import { Elysia } from "elysia";
import { log } from "evlog";

export interface RateLimitOptions {
	max: number;
	windowSeconds: number;
	namespace: string;
}

async function checkRateLimit(
	identifier: string,
	opts: RateLimitOptions,
): Promise<{ limited: boolean; remaining: number; retryAfter: number }> {
	const key = `rate-limit:mgmt:${opts.namespace}:${identifier}`;

	try {
		const count = await redis.increment(key);

		if (count === 1) {
			await redis.expire(key, opts.windowSeconds);
		}

		const remaining = Math.max(0, opts.max - count);

		if (count > opts.max) {
			const retryAfter = await redis.ttl(key);
			return {
				limited: true,
				remaining: 0,
				retryAfter: Math.max(retryAfter, 1),
			};
		}

		return { limited: false, remaining, retryAfter: 0 };
	} catch (err) {
		log.error({
			message: "Rate limiter Redis error — failing open",
			error: err instanceof Error ? err.message : String(err),
		});
		return { limited: false, remaining: opts.max, retryAfter: 0 };
	}
}

/**
 * Extracts the best available client identifier for rate limiting.
 *
 * Priority:
 *  1. organizationId (authenticated requests — correct tenant scoping)
 *  2. IP address from X-Forwarded-For / CF-Connecting-IP (unauthenticated
 *     requests like the public preferences endpoints)
 *
 * L-4 fix: previously the middleware silently skipped rate limiting when
 * organizationId was absent, meaning public endpoints had no effective limit.
 */
function getRateLimitIdentifier(
	context: Record<string, unknown>,
	request: Request,
): string | undefined {
	const organizationId = context.organizationId as string | undefined;
	if (organizationId) return organizationId;

	// Fallback to IP for unauthenticated callers (public preferences endpoints).
	const headers = request.headers;
	const ip =
		headers.get("cf-connecting-ip") ??
		headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
		headers.get("x-real-ip");

	return ip ?? undefined;
}

export function rateLimitPlugin(opts: RateLimitOptions) {
	return new Elysia({ name: `rate-limit-${opts.namespace}` }).macro({
		rateLimit: {
			async resolve(context) {
				const identifier = getRateLimitIdentifier(
					context as Record<string, unknown>,
					context.request,
				);

				// If we cannot determine any identifier, fail open rather than
				// blocking all traffic (e.g. local dev without X-Forwarded-For).
				if (!identifier) return;

				const { status, set } = context;
				const result = await checkRateLimit(identifier, opts);

				set.headers["X-RateLimit-Limit"] = String(opts.max);
				set.headers["X-RateLimit-Remaining"] = String(result.remaining);
				set.headers["X-RateLimit-Window"] = String(opts.windowSeconds);

				if (result.limited) {
					set.headers["Retry-After"] = String(result.retryAfter);
					return status(429, {
						message: "Too many requests",
						why: `You have exceeded the limit of ${opts.max} requests per ${opts.windowSeconds}s window for this operation.`,
						fix: `Wait ${result.retryAfter} second(s) before retrying.`,
						retryAfter: result.retryAfter,
					});
				}
			},
		},
	});
}
