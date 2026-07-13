import { RedisCache } from "@reloop/cache/redis-client";
import { SESSION_CACHE_REDIS_PREFIX } from "@reloop/auth/middleware/eviction/session-cache-redis-prefix";
import {
	type AuthRedis,
	DEFAULT_SESSION_CACHE_TTL_SECONDS,
} from "@reloop/auth/middleware/types";

export function createSessionCacheRedis(
	redisUrl: string,
	ttl: number = DEFAULT_SESSION_CACHE_TTL_SECONDS,
): AuthRedis {
	return new RedisCache(SESSION_CACHE_REDIS_PREFIX, ttl, redisUrl);
}
