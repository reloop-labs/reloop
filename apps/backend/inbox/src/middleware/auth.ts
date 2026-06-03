import { createId } from "@paralleldrive/cuid2";
import { Elysia } from "elysia";
import { evlog } from "evlog/elysia";
import { inboxConfig } from "../inbox.config";
import { AuthErrors, InboxError } from "../lib/errors";
import { validateApiKey } from "./api-key-auth";
import { validateSession } from "./cookie-auth";

if (inboxConfig.NODE_ENV !== "production") {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export const authMiddleware = new Elysia({ name: "auth-middleware" })
	.use(evlog())
	.macro({
		cookieAuth: {
			async resolve({ request: { headers }, log }) {
				const traceId = `req_${createId()}`;
				log.set({ traceId });

				try {
					const cookie = headers.get("cookie");
					const sessionResult = await validateSession(cookie);
					if (sessionResult) {
						log.set({
							traceId,
							service: "inbox",
							authType: "session",
							organizationId: sessionResult.activeOrganizationId,
							userId: sessionResult.userId,
						});
						return {
							...sessionResult,
							organizationId: sessionResult.activeOrganizationId,
							traceId,
						};
					}
				} catch (e) {
					if (e instanceof InboxError) {
						throw AuthErrors.authenticationFailed(
							e.message,
							"Authentication failed due to an inbox service error",
						);
					}
					log.error("Authentication error", {
						error: e instanceof Error ? e.message : "Unknown error",
						stack: e instanceof Error ? e.stack : undefined,
					});
					throw AuthErrors.authenticationFailed(
						e instanceof Error
							? e.message
							: "Unknown error during authentication",
					);
				}

				throw AuthErrors.unauthorized("No valid session cookie found");
			},
		},
		apiKeyAuth: {
			async resolve({ request: { headers }, log }) {
				const traceId = `req_${createId()}`;
				log.set({ traceId, service: "inbox" });

				try {
					const apiKey = headers.get("x-api-key");
					const apiKeyResult = await validateApiKey(apiKey);
					if (apiKeyResult) {
						log.set({
							authType: "apiKey",
							organizationId: apiKeyResult.organizationId,
							userId: apiKeyResult.userId,
						});
						log.info("API key authentication successful");
						return {
							userId: apiKeyResult.userId,
							organizationId: apiKeyResult.organizationId,
							authType: apiKeyResult.authType,
							apiKeyId: apiKeyResult.apiKeyId,
							traceId,
						};
					}
				} catch (e) {
					if (e instanceof InboxError) {
						throw AuthErrors.authenticationFailed(
							e.message,
							"API key validation failed due to an inbox service error",
						);
					}
					log.error("Authentication error", {
						error: e instanceof Error ? e.message : "Unknown error",
						stack: e instanceof Error ? e.stack : undefined,
					});
					throw AuthErrors.authenticationFailed(
						e instanceof Error
							? e.message
							: "Unknown error during API key validation (Internal server error)",
					);
				}

				throw AuthErrors.unauthorized(
					"No valid API key found in x-api-key header",
				);
			},
			detail: {
				security: [{ apiKey: [] }],
			},
		},
		auth: {
			async resolve({ request: { headers }, log }) {
				const traceId = `req_${createId()}`;
				log.set({ traceId, service: "inbox" });

				try {
					const apiKey = headers.get("x-api-key");
					const cookie = headers.get("cookie");
					const apiKeyResult = await validateApiKey(apiKey);
					if (apiKeyResult) {
						log.set({
							authType: "apiKey",
							organizationId: apiKeyResult.organizationId,
							userId: apiKeyResult.userId,
						});
						log.info("API key authentication successful");
						return {
							userId: apiKeyResult.userId,
							organizationId: apiKeyResult.organizationId,
							authType: apiKeyResult.authType,
							apiKeyId: apiKeyResult.apiKeyId,
							traceId,
						};
					}
					const sessionResult = await validateSession(cookie);
					if (sessionResult) {
						log.set({
							authType: "session",
							organizationId: sessionResult.activeOrganizationId,
							userId: sessionResult.userId,
						});
						log.info("Session authentication successful");
						return {
							...sessionResult,
							organizationId: sessionResult.activeOrganizationId,
							traceId,
						};
					}
				} catch (e) {
					if (e instanceof InboxError) {
						throw AuthErrors.authenticationFailed(
							e.message,
							"Authentication failed due to an inbox service error",
						);
					}
					log.error("Authentication error", {
						error: e instanceof Error ? e.message : "Unknown error",
						stack: e instanceof Error ? e.stack : undefined,
					});
					throw AuthErrors.authenticationFailed(
						e instanceof Error
							? e.message
							: "Unknown error during authentication (Internal server error)",
					);
				}
				throw AuthErrors.unauthorized(
					"Neither a valid API key nor a session cookie was found",
				);
			},
			detail: {
				security: [{ apiKey: [] }],
			},
		},
	});
