import {
	createAuthPlugin,
	SESSION_CACHE_REDIS_PREFIX,
} from "@reloop/auth/middleware";
import { RedisCache } from "@reloop/cache/redis-client";
import { Elysia } from "elysia";
import { evlog } from "evlog/elysia";
import { inboxConfig } from "../inbox.config";

if (inboxConfig.NODE_ENV !== "production") {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const sessionRedis = new RedisCache(
	SESSION_CACHE_REDIS_PREFIX,
	5,
	inboxConfig.REDIS_URL,
);

/** Batch A migration: shared auth plugin (fail-closed org via `auth`). */
export const authMiddleware = new Elysia({ name: "auth-middleware" })
	.use(evlog())
	.use(
		createAuthPlugin({
			baseUrl: inboxConfig.BASE_URL,
			redis: sessionRedis,
			ttl: 5,
		}),
	);
