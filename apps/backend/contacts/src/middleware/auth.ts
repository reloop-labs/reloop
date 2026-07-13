import { contactsConfig } from "@be/contacts/contacts.config";
import {
	createAuthPlugin,
	SESSION_CACHE_REDIS_PREFIX,
} from "@reloop/auth/middleware";
import { RedisCache } from "@reloop/cache/redis-client";
import { Elysia } from "elysia";
import { evlog } from "evlog/elysia";

if (contactsConfig.NODE_ENV !== "production") {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

/**
 * Shared session-validation cache (token-keyed, 5s TTL).
 * Replaces the previous cookie-hash cache in this service — same latency
 * property, now aligned with central eviction in the auth service.
 */
const sessionRedis = new RedisCache(
	SESSION_CACHE_REDIS_PREFIX,
	5,
	contactsConfig.REDIS_URL,
);

/** Special-services migration: contacts mounts the shared plugin. */
export const authMiddleware = new Elysia({ name: "auth-middleware" })
	.use(evlog())
	.use(
		createAuthPlugin({
			baseUrl: contactsConfig.BASE_URL,
			redis: sessionRedis,
			ttl: 5,
		}),
	);
