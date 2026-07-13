import { RedisCache } from "@reloop/cache/redis-client";
import { SESSION_CACHE_REDIS_PREFIX } from "./session-cache-redis-prefix";
import {
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
