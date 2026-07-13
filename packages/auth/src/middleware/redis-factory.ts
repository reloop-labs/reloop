import { RedisCache } from "@reloop/cache/redis-client";
import { SESSION_CACHE_REDIS_PREFIX } from "./eviction";
import {
	type AuthMiddlewareConfig,
	type AuthRedis,
	DEFAULT_SESSION_CACHE_TTL_SECONDS,
} from "./types";

/**
 * Build the shared session-validation Redis client.
 * Prefix and default TTL are package-owned so central eviction hits the same keys.
 */
export function createSessionCacheRedis(
	redisUrl: string,
	ttl: number = DEFAULT_SESSION_CACHE_TTL_SECONDS,
): AuthRedis {
	return new RedisCache(SESSION_CACHE_REDIS_PREFIX, ttl, redisUrl);
}

/**
 * Resolve the Redis client from plugin config.
 * `redis` override wins (tests); otherwise `redisUrl` is required.
 */
export function resolveAuthRedis(config: AuthMiddlewareConfig): AuthRedis {
	if (config.redis) return config.redis;
	if (!config.redisUrl) {
		throw new Error(
			"createAuthPlugin requires redisUrl (or redis override for tests)",
		);
	}
	const ttl = config.ttl ?? DEFAULT_SESSION_CACHE_TTL_SECONDS;
	return createSessionCacheRedis(config.redisUrl, ttl);
}
