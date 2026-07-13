import { adminConfig } from "@reloop/admin/admin.config";
import { createAuthPlugin } from "@reloop/auth/middleware";
import { Elysia } from "elysia";
import { evlog } from "evlog/elysia";

if (adminConfig.NODE_ENV !== "production") {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export const authMiddleware = new Elysia({
	name: "admin-auth-middleware",
})
	.use(evlog())
	.use(
		createAuthPlugin({
			baseUrl: adminConfig.BASE_URL,
			redisUrl: adminConfig.REDIS_URL,
			ttl: 5,
		}),
	);
