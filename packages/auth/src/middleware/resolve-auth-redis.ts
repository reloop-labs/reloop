import { createSessionCacheRedis } from "./create-session-cache-redis";
import {
	type AuthMiddlewareConfig,
	type AuthRedis,
	DEFAULT_SESSION_CACHE_TTL_SECONDS,
} from "./types";

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
