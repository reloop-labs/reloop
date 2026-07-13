import { createAuthPlugin } from "@reloop/auth/middleware";
import { logsConfig } from "@reloop/logs/logs.config";
import { Elysia } from "elysia";
import { evlog } from "evlog/elysia";

if (logsConfig.NODE_ENV !== "production") {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export const authMiddleware = new Elysia({ name: "auth-middleware" })
	.use(evlog())
	.use(
		createAuthPlugin({
			baseUrl: logsConfig.BASE_URL,
			redisUrl: logsConfig.REDIS_URL,
			ttl: 5,
		}),
	);
