import { RedisCache } from "@reloop/cache/redis-client";
import { SESSION_CACHE_REDIS_PREFIX } from "../middleware/eviction/session-cache-redis-prefix";
import { authServerConfig } from "./config";

/**
 * Shared session-validation cache used by the middleware plugin and by
 * central eviction in the auth service. Must use {@link SESSION_CACHE_REDIS_PREFIX}
 * so every service hits the same Redis keys.
 */
export const sessionCacheRedis = new RedisCache(
	SESSION_CACHE_REDIS_PREFIX,
	5,
	authServerConfig.REDIS_URL,
);
