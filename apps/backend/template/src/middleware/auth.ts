import { templateConfig } from "@be/template/template.config";
import { createAuthPlugin } from "@reloop/auth/middleware";
import { Elysia } from "elysia";
import { evlog } from "evlog/elysia";

if (templateConfig.NODE_ENV !== "production") {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

/**
 * Collaboration websocket uses `authCollab` (profile + fail-closed org).
 */
export const authMiddleware = new Elysia({ name: "better-auth" })
	.use(evlog())
	.use(
		createAuthPlugin({
			baseUrl: templateConfig.BASE_URL,
			redisUrl: templateConfig.REDIS_URL,
			ttl: 5,
		}),
	);
