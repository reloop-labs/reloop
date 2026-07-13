import { createAuthPlugin } from "@reloop/auth/middleware";
import { Elysia } from "elysia";
import { contactsConfig } from "../contacts.config";

if (contactsConfig.NODE_ENV !== "production") {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export const authMiddleware = new Elysia({ name: "auth-middleware" }).use(
	createAuthPlugin({
		baseUrl: contactsConfig.BASE_URL,
		redisUrl: contactsConfig.REDIS_URL,
		ttl: 5,
	}),
);
