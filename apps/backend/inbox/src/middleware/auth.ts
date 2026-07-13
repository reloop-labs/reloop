import { createAuthPlugin } from "@reloop/auth/middleware";
import { Elysia } from "elysia";
import { evlog } from "evlog/elysia";
import { inboxConfig } from "../inbox.config";

if (inboxConfig.NODE_ENV !== "production") {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export const authMiddleware = new Elysia({ name: "auth-middleware" })
	.use(evlog())
	.use(
		createAuthPlugin({
			baseUrl: inboxConfig.BASE_URL,
			redisUrl: inboxConfig.REDIS_URL,
			ttl: 5,
		}),
	);
