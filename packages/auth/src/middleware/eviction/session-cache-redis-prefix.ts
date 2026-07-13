/**
 * Shared RedisCache prefix for the short-TTL session validation cache.
 * Every service that mounts createAuthPlugin must use this prefix so central
 * eviction hits the same keys.
 */
export const SESSION_CACHE_REDIS_PREFIX = "reloop-session";
