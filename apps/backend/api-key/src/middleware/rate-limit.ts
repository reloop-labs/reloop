import { redis } from "@reloop/api-key/utils/loader";
import { Elysia } from "elysia";
import { log } from "evlog";

export interface RateLimitOptions {
	max: number;

	windowSeconds: number;

	namespace: string;
}

async function checkRateLimit(
	organizationId: string,
	opts: RateLimitOptions,
): Promise<{ limited: boolean; remaining: number; retryAfter: number }> {
	const key = `rate-limit:mgmt:${opts.namespace}:${organizationId}`;

	try {
		const count = await redis.increment(key);

		if (count === 1) {
			await redis.expire(key, opts.windowSeconds);
		}

		const remaining = Math.max(0, opts.max - count);

		if (count > opts.max) {
			const retryAfter = await redis.ttl(key);
			return { limited: true, remaining: 0, retryAfter: Math.max(retryAfter, 1) };
		}

		return { limited: false, remaining, retryAfter: 0 };
	} catch (err) {
		log.error({
			error: err instanceof Error ? err.message : String(err),
			message: "Rate limiter Redis error — failing open",
		});
		return { limited: false, remaining: opts.max, retryAfter: 0 };
	}
}

export function rateLimitPlugin(opts: RateLimitOptions) {
	return new Elysia({ name: `rate-limit-${opts.namespace}` }).macro({
		rateLimit: {
			async resolve(context) {
				const organizationId = (context as Record<string, unknown>)
					.organizationId as string | undefined;

				if (!organizationId) return;

				const { status, set } = context;
				const result = await checkRateLimit(organizationId, opts);

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
