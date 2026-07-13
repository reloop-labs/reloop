import { RedisCache } from "@reloop/cache/redis-client";
import { SESSION_CACHE_REDIS_PREFIX } from "../middleware/eviction/session-cache-redis-prefix";
import { authServerConfig } from "./config";

export const sessionCacheRedis = new RedisCache(
	SESSION_CACHE_REDIS_PREFIX,
	5,
	authServerConfig.REDIS_URL,
);
