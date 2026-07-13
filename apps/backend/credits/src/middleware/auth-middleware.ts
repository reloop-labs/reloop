import {
	createAuthPlugin,
	SESSION_CACHE_REDIS_PREFIX,
} from "@reloop/auth/middleware";
import { RedisCache } from "@reloop/cache/redis-client";
import { creditsConfig } from "@reloop/credits/credits.config";
import { Elysia } from "elysia";
import { evlog } from "evlog/elysia";

if (creditsConfig.NODE_ENV !== "production") {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const sessionRedis = new RedisCache(
	SESSION_CACHE_REDIS_PREFIX,
	5,
	creditsConfig.REDIS_URL,
);

/**
 * Special-services migration: credits mounts the shared plugin.
 * - Customer routes: `auth` (fail-closed org)
 * - Top-up / admin: `platformAdmin`
 */
export const authMiddleware = new Elysia({
	name: "billing-auth-middleware",
})
	.use(evlog())
	.use(
		createAuthPlugin({
			baseUrl: creditsConfig.BASE_URL,
			redis: sessionRedis,
			ttl: 5,
		}),
	);
