import { createAuthPlugin } from "@reloop/auth/middleware";
import { Elysia } from "elysia";
import { apiKeyConfig } from "../api-key.config";

if (apiKeyConfig.NODE_ENV !== "production") {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export const authMiddleware = new Elysia({ name: "auth-middleware" }).use(
	createAuthPlugin({
		baseUrl: apiKeyConfig.BASE_URL,
		redisUrl: apiKeyConfig.REDIS_URL,
		ttl: 5,
	}),
);
