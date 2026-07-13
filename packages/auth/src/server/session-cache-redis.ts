import { SESSION_CACHE_REDIS_PREFIX } from "@reloop/auth/middleware/eviction/session-cache-redis-prefix";
import { authServerConfig } from "@reloop/auth/server/config";
import { RedisCache } from "@reloop/cache/redis-client";

export const sessionCacheRedis = new RedisCache(
	SESSION_CACHE_REDIS_PREFIX,
	5,
	authServerConfig.REDIS_URL,
);
