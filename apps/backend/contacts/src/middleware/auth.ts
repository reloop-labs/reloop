import { contactsConfig } from "@be/contacts/contacts.config";
import { Elysia } from "elysia";
import { log } from "evlog";
import { validateApiKey } from "./api-key-auth";
import { validateSession } from "./cookie-auth";

if (contactsConfig.NODE_ENV !== "production") {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export const authMiddleware = new Elysia({ name: "auth-middleware" }).macro({
	cookieAuth: {
		async resolve({ status, request: { headers } }) {
			try {
				const cookie = headers.get("cookie");
				const traceId = crypto.randomUUID();
				const currentLogger = log;
				const sessionResult = await validateSession(cookie);
				if (sessionResult) {
					const tenantLogger = currentLogger.child({
						traceId,
						service: "contacts",
						...currentLogger,
					});
					tenantLogger.info(
						{ ...sessionResult },
						"Session authentication successful",
					);
					return { ...sessionResult, traceId, logger: tenantLogger };
				}
				return status(401, { message: "Authentication required" });
			} catch (e) {
				log.error({
					...{
						error: e instanceof Error ? e.message : "Unknown error",
						stack: e instanceof Error ? e.stack : undefined,
					},
					message: "Authentication error",
				});
				return status(401, { message: "Authentication failed" });
			}
		},
	},
	apiKeyAuth: {
		async resolve({ status, request: { headers } }) {
			try {
				const apiKey = headers.get("x-api-key");
				const traceId = crypto.randomUUID();
				const currentLogger = log;
				const apiKeyResult = await validateApiKey(apiKey);
				if (apiKeyResult) {
					const tenantLogger = currentLogger.child({
						traceId,
						service: "contacts",
						...currentLogger,
					});
					tenantLogger.info(
						{ ...apiKeyResult },
						"API key authentication successful",
					);
					return { ...apiKeyResult, traceId, logger: tenantLogger };
				}
				return status(401, { message: "Authentication required" });
			} catch (e) {
				log.error({
					...{
						error: e instanceof Error ? e.message : "Unknown error",
						stack: e instanceof Error ? e.stack : undefined,
					},
					message: "Authentication error",
				});
				return status(401, { message: "Authentication failed" });
			}
		},
		detail: {
			security: [{ apiKey: [] }],
		},
	},
	auth: {
		async resolve({ status, request: { headers } }) {
			try {
				const apiKey = headers.get("x-api-key");
				const cookie = headers.get("cookie");
				const traceId = crypto.randomUUID();
				const currentLogger = log;
				const apiKeyResult = await validateApiKey(apiKey);
				if (apiKeyResult) {
					const tenantLogger = currentLogger.child({
						traceId,
						service: "contacts",
						...currentLogger,
					});
					tenantLogger.info(
						{ ...apiKeyResult },
						"API key authentication successful",
					);
					return { ...apiKeyResult, traceId, logger: tenantLogger };
				}
				const sessionResult = await validateSession(cookie);
				if (sessionResult) {
					const tenantLogger = currentLogger.child({
						traceId,
						service: "contacts",
						...currentLogger,
					});
					tenantLogger.info(
						{ ...sessionResult },
						"Session authentication successful",
					);
					return { ...sessionResult, traceId, logger: tenantLogger };
				}
				return status(401, { message: "Authentication required" });
			} catch (e) {
				log.error({
					...{
						error: e instanceof Error ? e.message : "Unknown error",
						stack: e instanceof Error ? e.stack : undefined,
					},
					message: "Authentication error",
				});
				return status(401, { message: "Authentication failed" });
			}
		},
		detail: {
			security: [{ apiKey: [] }],
		},
	},
});
