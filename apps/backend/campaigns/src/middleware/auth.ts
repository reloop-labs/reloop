import { campaignsConfig } from "@be/campaigns/campaigns.config";
import { createAuthPlugin } from "@reloop/auth/middleware";
import { Elysia } from "elysia";
import { evlog } from "evlog/elysia";

if (campaignsConfig.NODE_ENV !== "production") {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export const authMiddleware = new Elysia({ name: "auth-middleware" })
	.use(evlog())
	.use(
		createAuthPlugin({
			baseUrl: campaignsConfig.BASE_URL,
			redisUrl: campaignsConfig.REDIS_URL,
			ttl: 5,
			internalSecret: campaignsConfig.RELOOP_INTERNAL_SECRET,
		}),
	);
