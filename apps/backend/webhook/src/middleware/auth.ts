import { createAuthPlugin } from "@reloop/auth/middleware";
import { Elysia } from "elysia";
import { evlog } from "evlog/elysia";
import { webhookConfig } from "../webhook.config";

if (webhookConfig.NODE_ENV !== "production") {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export const authMiddleware = new Elysia({ name: "auth-middleware" })
	.use(evlog())
	.use(
		createAuthPlugin({
			baseUrl: webhookConfig.BASE_URL,
			redisUrl: webhookConfig.REDIS_URL,
			ttl: 5,
		}),
	);
