import { createHash } from "node:crypto";
import { sanitizeInternalSecret } from "@reloop/auth/middleware/internal-secret";
import { extractSessionToken } from "@reloop/auth/middleware/keys";
import {
	applyResponseHeaders,
	buildRateLimitHeaders,
} from "@reloop/auth/middleware/rate-limit-headers";
import { extractApiKey } from "@reloop/auth/middleware/resolve/extract-api-key";
import { timingSafeStringEqual } from "@reloop/auth/middleware/resolve/resolve-internal-auth";
import { INTERNAL_SECRET_HEADER } from "@reloop/auth/middleware/types";
import { RedisCache } from "@reloop/cache/redis-client";
import { Elysia } from "elysia";
import { log } from "evlog";

/** Raw-key counter ops (RedisCache satisfies this). */
export type ApiRateLimitRedis = {
	increment(rawKey: string): Promise<number>;
	expire(rawKey: string, seconds: number): Promise<number>;
	ttl(rawKey: string): Promise<number>;
};

export type ApiRateLimitOptions = {
	redisUrl?: string;
	/** Test override. */
	redis?: ApiRateLimitRedis;
	/** Requests per window per client. Defaults to API_RATE_LIMIT_MAX or 600. */
	max?: number;
	/** Window length. Defaults to API_RATE_LIMIT_WINDOW_SECONDS or 60. */
	windowSeconds?: number;
	/**
	 * Requests carrying this internal secret skip the limit, so service fan-out
	 * from one egress IP is never throttled. Defaults to RELOOP_INTERNAL_SECRET.
	 */
	internalSecret?: string;
	/** Path suffixes that skip the limit (health probes). */
	excludePathSuffixes?: string[];
};

const DEFAULT_EXCLUDE_SUFFIXES = ["/health", "/healthz"];
const REDIS_DEADLINE_MS = 250;
const KEY_PREFIX = "rl:api";

function envInt(name: string, fallback: number): number {
	const value = Number(process.env[name]);
	return Number.isInteger(value) && value > 0 ? value : fallback;
}

function pathnameOf(request: Request): string {
	try {
		return new URL(request.url).pathname.replace(/\/+$/, "") || "/";
	} catch {
		return request.url;
	}
}

const hash = (value: string) =>
	createHash("sha256").update(value).digest("hex").slice(0, 32);

/**
 * Bucket per credential so one customer behind a shared IP (or many keys on
 * one IP) is metered fairly; anonymous traffic falls back to the client IP.
 */
function clientKey(request: Request, peerIp: string | undefined): string {
	const apiKey = extractApiKey(request.headers);
	if (apiKey) return `key:${hash(apiKey)}`;

	const session = extractSessionToken(request.headers.get("cookie"));
	if (session) return `session:${hash(session)}`;

	const ip =
		request.headers.get("cf-connecting-ip")?.trim() ||
		request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
		request.headers.get("x-real-ip")?.trim() ||
		peerIp ||
		"unknown";
	return `ip:${ip}`;
}

async function consume(
	redis: ApiRateLimitRedis,
	key: string,
	windowSeconds: number,
): Promise<{ count: number; ttl: number }> {
	const count = await redis.increment(key);
	if (count === 1) await redis.expire(key, windowSeconds);

	// A key without an expiry would count forever; re-arm the window.
	let ttl = await redis.ttl(key);
	if (ttl < 0) {
		await redis.expire(key, windowSeconds);
		ttl = windowSeconds;
	}
	return { count, ttl };
}

function withDeadline<T>(promise: Promise<T>, ms: number): Promise<T> {
	let timer: ReturnType<typeof setTimeout> | undefined;
	return Promise.race([
		promise,
		new Promise<never>((_, reject) => {
			timer = setTimeout(
				() => reject(new Error(`timed out after ${ms}ms`)),
				ms,
			);
		}),
	]).finally(() => clearTimeout(timer));
}

/**
 * Baseline per-client rate limit for every API route, with `ratelimit-*`
 * headers on every response (including 401/404) so clients and agents can
 * pace themselves. Routes with stricter limiters overwrite these headers with
 * their own. Shares one Redis bucket across services. Fails open when Redis
 * is slow or down. Apply once on the root app, before routes.
 */
export function apiRateLimitPlugin(opts: ApiRateLimitOptions = {}) {
	const max = opts.max ?? envInt("API_RATE_LIMIT_MAX", 600);
	const windowSeconds =
		opts.windowSeconds ?? envInt("API_RATE_LIMIT_WINDOW_SECONDS", 60);
	const exclude = opts.excludePathSuffixes ?? DEFAULT_EXCLUDE_SUFFIXES;
	const internalSecret =
		opts.internalSecret ??
		sanitizeInternalSecret(process.env.RELOOP_INTERNAL_SECRET);
	const redis: ApiRateLimitRedis =
		opts.redis ?? new RedisCache(KEY_PREFIX, windowSeconds, opts.redisUrl);

	return new Elysia({ name: "reloop-api-rate-limit" })
		.onRequest(async ({ request, set, server }) => {
			const path = pathnameOf(request);
			if (exclude.some((suffix) => path.endsWith(suffix))) return;

			const internal = request.headers.get(INTERNAL_SECRET_HEADER);
			if (
				internal &&
				internalSecret &&
				timingSafeStringEqual(internal, internalSecret)
			) {
				return;
			}

			const key = `${KEY_PREFIX}:${clientKey(request, server?.requestIP(request)?.address)}`;
			let result: { count: number; ttl: number };
			try {
				result = await withDeadline(
					consume(redis, key, windowSeconds),
					REDIS_DEADLINE_MS,
				);
			} catch (err) {
				log.error({
					error: err instanceof Error ? err.message : String(err),
					message: "API rate limiter Redis error — failing open",
				});
				return;
			}

			const limited = result.count > max;
			const resetSeconds = Math.max(result.ttl, 1);
			applyResponseHeaders(
				set.headers as Record<string, string>,
				buildRateLimitHeaders({
					limit: max,
					remaining: max - result.count,
					resetSeconds,
					retryAfter: limited ? resetSeconds : undefined,
				}),
			);

			if (limited) {
				set.status = 429;
				return {
					message: "Too many requests",
					why: `This client exceeded ${max} API requests per ${windowSeconds}s.`,
					fix: `Wait ${resetSeconds} second(s) before retrying, and pace requests using the ratelimit-remaining and ratelimit-reset headers.`,
					link: "https://reloop.sh/docs/api/usage-limits",
				};
			}
		})
		.as("global");
}
