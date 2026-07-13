import { createAuthPlugin } from "@reloop/auth/middleware";
import { domainConfig } from "@reloop/domain/domain.config";
import { Elysia } from "elysia";
import { evlog } from "evlog/elysia";

if (domainConfig.NODE_ENV !== "production") {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export const authMiddleware = new Elysia({ name: "auth-middleware" })
	.use(evlog())
	.use(
		createAuthPlugin({
			baseUrl: domainConfig.BASE_URL,
			redisUrl: domainConfig.REDIS_URL,
			ttl: 5,
			internalSecret: domainConfig.RELOOP_INTERNAL_SECRET,
		}),
	);
