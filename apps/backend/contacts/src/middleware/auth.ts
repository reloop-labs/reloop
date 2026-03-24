import { contactsConfig } from "@be/contacts/contacts.config";
import { logger } from "@reloop/logger";
import { Elysia } from "elysia";
import { validateApiKey } from "./api-key-auth";
import { validateSession } from "./cookie-auth";

if (contactsConfig.NODE_ENV !== "production") {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export const authMiddleware = new Elysia({ name: "auth-middleware" }).macro({
	auth: {
		async resolve({ status, request: { headers } }) {
			try {
				const apiKey =
					headers.get("x-api-key") ||
					headers.get("authorization")?.replace("Bearer ", "");
				const cookie = headers.get("cookie");
				const traceId = crypto.randomUUID();
				const currentLogger = logger.child({ traceId });
				const apiKeyResult = await validateApiKey(apiKey);
				if (apiKeyResult) {
					currentLogger.info({ apiKeyResult, traceId, }, "API key authentication successful");
					return { ...apiKeyResult, traceId, logger: currentLogger };
				}

				const sessionResult = await validateSession(cookie);
				if (sessionResult) {
					currentLogger.info({ sessionResult, traceId, }, "Session authentication successful");
					return { ...sessionResult, traceId, logger: currentLogger };
				}
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
		detail: {
			security: [{ apiKey: [] }],
		},
	}
});
