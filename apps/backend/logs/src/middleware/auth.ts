import { logsConfig } from "@reloop/logs/logs.config";
import { Elysia } from "elysia";
import { evlog } from "evlog/elysia";
import { validateApiKey } from "./api-key-auth";
import { validateSession } from "./cookie-auth";

if (logsConfig.NODE_ENV !== "production") {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export const authMiddleware = new Elysia({ name: "auth-middleware" })
	.use(evlog())
	.macro({
		insertAuth: {
			async resolve({ status, request: { headers }, log }) {
				try {
					const apiKey =
						headers.get("x-api-key") ||
						headers.get("authorization")?.replace("Bearer ", "");
					const cookie = headers.get("cookie");
					const traceId = crypto.randomUUID();
					log.set({ traceId, service: "logs" });

					const apiKeyResult = await validateApiKey(apiKey);
					if (apiKeyResult) {
						log.set({
							user: apiKeyResult.userId,
							organizationId: apiKeyResult.organizationId,
						});
						log.info("API key authentication successful");
						return {
							...apiKeyResult,
							organizationId: apiKeyResult.organizationId,
							activeOrganizationId: apiKeyResult.organizationId,
							traceId,
							logger: log,
						};
					}

					const sessionResult = await validateSession(cookie);
					if (sessionResult) {
						log.set({
							user: sessionResult.userId,
							organizationId: sessionResult.organizationId,
						});
						log.info("Session authentication successful");
						return {
							...sessionResult,
							organizationId: sessionResult.organizationId,
							activeOrganizationId: sessionResult.organizationId,
							traceId,
							logger: log,
						};
					}

					return status(401, { message: "Authentication required" });
				} catch (e) {
					log.error("Authentication error", {
						error: e instanceof Error ? e.message : "Unknown error",
						stack: e instanceof Error ? e.stack : undefined,
					});
					return status(401, { message: "Authentication failed" });
				}
			},
		},
		auth: {
			async resolve({ status, request: { headers }, log }) {
				try {
					const apiKey =
						headers.get("x-api-key") ||
						headers.get("authorization")?.replace("Bearer ", "");
					const cookie = headers.get("cookie");
					const traceId = crypto.randomUUID();
					log.set({ traceId, service: "logs" });

					const apiKeyResult = await validateApiKey(apiKey);
					if (apiKeyResult) {
						log.set({
							user: apiKeyResult.userId,
							organizationId: apiKeyResult.organizationId,
						});
						log.info("API key authentication successful");
						return {
							...apiKeyResult,
							organizationId: apiKeyResult.organizationId,
							activeOrganizationId: apiKeyResult.organizationId,
							traceId,
							logger: log,
						};
					}

					const sessionResult = await validateSession(cookie);
					if (sessionResult) {
						log.set({
							user: sessionResult.userId,
							organizationId: sessionResult.organizationId,
						});
						log.info("Session authentication successful");
						return {
							...sessionResult,
							organizationId: sessionResult.organizationId,
							activeOrganizationId: sessionResult.organizationId,
							traceId,
							logger: log,
						};
					}

					return status(401, { message: "Authentication required" });
				} catch (e) {
					log.error("Authentication error", {
						error: e instanceof Error ? e.message : "Unknown error",
						stack: e instanceof Error ? e.stack : undefined,
					});
					return status(401, { message: "Authentication failed" });
				}
			},
			detail: {
				security: [{ apiKey: [] }],
			},
		},
	});
