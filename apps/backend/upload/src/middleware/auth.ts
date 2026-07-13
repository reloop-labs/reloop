import { uploadConfig } from "@be/upload/upload.config";
import {
	createAuthPlugin,
	SESSION_CACHE_REDIS_PREFIX,
} from "@reloop/auth/middleware";
import { RedisCache } from "@reloop/cache/redis-client";
import { Elysia } from "elysia";
import { evlog } from "evlog/elysia";

if (uploadConfig.NODE_ENV !== "production") {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

/**
 * Shared session-validation + API-key cache.
 * Prefix must match {@link SESSION_CACHE_REDIS_PREFIX} so auth-service
 * central eviction hits the same keys.
 */
const sessionRedis = new RedisCache(
	SESSION_CACHE_REDIS_PREFIX,
	5,
	uploadConfig.REDIS_URL,
);

/**
 * Pilot migration (#49): mounts the shared `@reloop/auth/middleware` plugin.
 * Upload routes are user-scoped (not org-scoped) → use `authNoOrg`.
 */
export const authMiddleware = new Elysia({ name: "auth-middleware" })
	.use(evlog())
	.use(
		createAuthPlugin({
			baseUrl: uploadConfig.BASE_URL,
			redis: sessionRedis,
			ttl: 5,
		}),
	);
