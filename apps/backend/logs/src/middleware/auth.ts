import {
	createAuthPlugin,
	SESSION_CACHE_REDIS_PREFIX,
} from "@reloop/auth/middleware";
import { RedisCache } from "@reloop/cache/redis-client";
import { logsConfig } from "@reloop/logs/logs.config";
import { Elysia } from "elysia";
import { evlog } from "evlog/elysia";

if (logsConfig.NODE_ENV !== "production") {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const sessionRedis = new RedisCache(
	SESSION_CACHE_REDIS_PREFIX,
	5,
	logsConfig.REDIS_URL,
);

/** Batch B migration: shared auth plugin (fail-closed org via `auth`). */
export const authMiddleware = new Elysia({ name: "auth-middleware" })
	.use(evlog())
	.use(
		createAuthPlugin({
			baseUrl: logsConfig.BASE_URL,
			redis: sessionRedis,
			ttl: 5,
		}),
	);
