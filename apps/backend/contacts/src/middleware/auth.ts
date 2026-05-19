import { contactsConfig } from "@be/contacts/contacts.config";
import { Elysia } from "elysia";
import { evlog } from "evlog/elysia";
import { validateApiKey } from "./api-key-auth";
import { validateSession } from "./cookie-auth";

if (contactsConfig.NODE_ENV !== "production") {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export const authMiddleware = new Elysia({ name: "auth-middleware" })
	.use(evlog())
	.macro({
		cookieAuth: {
			async resolve({ status, request: { headers }, log }) {
				try {
					const cookie = headers.get("cookie");
					const traceId = crypto.randomUUID();
					log.set({ traceId, service: "contacts" });
					const sessionResult = await validateSession(cookie);
					if (sessionResult) {
						const result = {
							userId: sessionResult.userId,
							organizationId: sessionResult.activeOrganizationId,
							activeOrganizationId: sessionResult.activeOrganizationId,
							authType: "auth" as const,
						};
						log.set({
							...result,
						});
						log.info("Session authentication successful");
						return { ...result, traceId, logger: log };
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
		apiKeyAuth: {
			async resolve({ status, request: { headers }, log }) {
				try {
					const apiKey = headers.get("x-api-key");
					const traceId = crypto.randomUUID();
					log.set({ traceId, service: "contacts" });
					const apiKeyResult = await validateApiKey(apiKey);
					if (apiKeyResult) {
						const result = {
							userId: apiKeyResult.userId,
							organizationId: apiKeyResult.organizationId,
							activeOrganizationId: apiKeyResult.organizationId,
							authType: "apikey" as const,
						};
						log.set({
							...result,
						});
						log.info("API key authentication successful");
						return { ...result, traceId, logger: log };
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
		auth: {
			async resolve({ status, request: { headers }, log }) {
				try {
					const apiKey = headers.get("x-api-key");
					const cookie = headers.get("cookie");
					const traceId = crypto.randomUUID();
					log.set({ traceId, service: "contacts" });
					const apiKeyResult = await validateApiKey(apiKey);
					if (apiKeyResult) {
						const result = {
							userId: apiKeyResult.userId,
							organizationId: apiKeyResult.organizationId,
							authType: "apikey" as const,
						};
						log.set({
							...result,
						});
						log.info("API key authentication successful");
						return { ...result, traceId, logger: log };
					}
					const sessionResult = await validateSession(cookie);
					if (sessionResult) {
						const result = {
							userId: sessionResult.userId,
							organizationId: sessionResult.activeOrganizationId,
							activeOrganizationId: sessionResult.activeOrganizationId,
							authType: "auth" as const,
						};
						log.set({
							...result,
						});
						log.info("Session authentication successful");
						return { ...result, traceId, logger: log };
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
