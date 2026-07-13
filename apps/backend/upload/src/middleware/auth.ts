import { uploadConfig } from "@be/upload/upload.config";
import { createAuthPlugin } from "@reloop/auth/middleware";
import { Elysia } from "elysia";
import { evlog } from "evlog/elysia";

if (uploadConfig.NODE_ENV !== "production") {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

/**
 * Upload routes are user-scoped (not org-scoped) → use `authNoOrg`.
 */
export const authMiddleware = new Elysia({ name: "auth-middleware" })
	.use(evlog())
	.use(
		createAuthPlugin({
			baseUrl: uploadConfig.BASE_URL,
			redisUrl: uploadConfig.REDIS_URL,
			ttl: 5,
		}),
	);
