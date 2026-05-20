import { createId } from "@paralleldrive/cuid2";
import { uploadConfig } from "@be/upload/upload.config";
import { Elysia } from "elysia";
import { evlog } from "evlog/elysia";
import { validateApiKey } from "./api-key-auth";
import { validateSession } from "./cookie-auth";

if (uploadConfig.NODE_ENV !== "production") {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export const authMiddleware = new Elysia({ name: "auth-middleware" })
	.use(evlog())
	.macro({
		cookieAuth: {
			async resolve({ status, request: { headers }, log }) {
				try {
					const cookie = headers.get("cookie");
					const traceId = `req_${createId()}`;
					log.set({ traceId, service: "upload" });
					const sessionResult = await validateSession(cookie);
					if (sessionResult) {
						log.set({
							...sessionResult,
						});
						log.info("Session authentication successful");
						return { ...sessionResult, traceId };
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
					const traceId = `req_${createId()}`;
					log.set({ traceId, service: "upload" });
					const apiKeyResult = await validateApiKey(apiKey);
					if (apiKeyResult) {
						log.set({
							...apiKeyResult,
						});
						log.info("API key authentication successful");
						return { ...apiKeyResult, traceId };
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
					const traceId = `req_${createId()}`;
					log.set({ traceId, service: "upload" });
					const apiKeyResult = await validateApiKey(apiKey);
					if (apiKeyResult) {
						log.set({
							...apiKeyResult,
						});
						log.info("API key authentication successful");
						return {
							...apiKeyResult,
							traceId,
							user: { id: apiKeyResult.userId },
						};
					}
					const sessionResult = await validateSession(cookie);
					if (sessionResult) {
						log.set({
							...sessionResult,
						});
						log.info("Session authentication successful");
						return {
							...sessionResult,
							traceId,
							user: { id: sessionResult.userId },
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
