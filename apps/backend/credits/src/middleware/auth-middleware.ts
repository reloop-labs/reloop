import { createAuthPlugin } from "@reloop/auth/middleware";
import { creditsConfig } from "@reloop/credits/credits.config";
import { Elysia } from "elysia";
import { evlog } from "evlog/elysia";

if (creditsConfig.NODE_ENV !== "production") {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export const authMiddleware = new Elysia({
	name: "billing-auth-middleware",
})
	.use(evlog())
	.use(
		createAuthPlugin({
			baseUrl: creditsConfig.BASE_URL,
			redisUrl: creditsConfig.REDIS_URL,
			ttl: 5,
		}),
	);
