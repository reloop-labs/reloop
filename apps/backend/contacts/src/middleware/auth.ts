import { contactsConfig } from "@be/contacts/contacts.config";
import { logger } from "@reloop/logger";
import { Elysia } from "elysia";
import { validateApiKey } from "./api-key-auth";
import { validateSession } from "./cookie-auth";

if (contactsConfig.NODE_ENV !== "production") {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export const authMiddleware = new Elysia({ name: "AuthMiddleware" }).macro({
	auth: {
		async resolve({ status, request: { headers } }) {
			try {
				const apiKey = headers.get("x-api-key") || headers.get("authorization")?.replace("Bearer ", "");
				const cookie = headers.get("cookie");

				// 1. Check for API Token
				const apiKeyResult = await validateApiKey(apiKey);
				if (apiKeyResult) return apiKeyResult;

				// 2. Fallback to Session Cookie
				const sessionResult = await validateSession(cookie);
				if (sessionResult) return sessionResult;

				return status(401, { message: "Authentication required" });
			} catch (e) {
				logger.error(
					{
						error: e instanceof Error ? e.message : "Unknown error",
						stack: e instanceof Error ? e.stack : undefined,
					},
					"Authentication error",
				);
				return status(401, { message: "Authentication failed" });
			}
		},
	},
});
