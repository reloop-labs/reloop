import { Elysia } from "elysia";
import { log } from "evlog";
import { useLogger } from "evlog/elysia";
import { validateApiKey } from "./api-key-auth";
import { validateSession } from "./cookie-auth";

if (process.env.NODE_ENV !== "production") {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export const authMiddleware = new Elysia({ name: "auth-middleware" }).macro({
	cookieAuth: {
		async resolve({ status, request: { headers } }) {
			try {
				const log = useLogger();
				const cookie = headers.get("cookie");
				const traceId = crypto.randomUUID();
				const sessionResult = await validateSession(cookie);

				if (sessionResult) {
					log.set({
						traceId,
						user: sessionResult.userId,
						organizationId: sessionResult.userId,
					});
					return { ...sessionResult, traceId };
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
				const log = useLogger();
				const apiKey = headers.get("x-api-key");
				const traceId = crypto.randomUUID();
				const apiKeyResult = await validateApiKey(apiKey);
				if (apiKeyResult) {
					log.set({
						traceId,
						user: apiKeyResult.userId,
						organizationId: apiKeyResult.organizationId,
					});
					return { ...apiKeyResult, traceId };
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
				const apiKey =
					headers.get("x-api-key") ||
					headers.get("authorization")?.replace("Bearer ", "");
				const cookie = headers.get("cookie");
				const traceId = crypto.randomUUID();
				const log = useLogger();
				const apiKeyResult = await validateApiKey(apiKey);
				if (apiKeyResult) {
					log.set({
						traceId,
						service: "api-key",
						user: apiKeyResult.userId,
						organizationId: apiKeyResult.organizationId,
					});
					log.info("API key authentication successful");
					return { ...apiKeyResult, traceId };
				}
				const sessionResult = await validateSession(cookie);
				if (sessionResult) {
					log.set({
						traceId,
						service: "api-key",
						user: sessionResult.userId,
						organizationId: sessionResult.organizationId,
					});
					log.info("Session authentication successful");
					return { ...sessionResult, traceId };
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
