import {
	MailingError,
	UnauthorizedError,
} from "@reloop/be-mailing/lib/errors";
import { Elysia } from "elysia";
import { evlog } from "evlog/elysia";
import { mailConfig } from "../mail.config";
import { validateApiKey } from "./api-key-auth";
import { validateSession } from "./cookie-auth";

if (mailConfig.NODE_ENV !== "production") {
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
					log.set({ traceId });
					const sessionResult = await validateSession(cookie);
					if (sessionResult) {
						log.set({
							traceId,
							service: "mail",
							authType: "session",
							activeOrganizationId: sessionResult.activeOrganizationId,
							userId: sessionResult.userId,
						});
						return { ...sessionResult, traceId, logger: log };
					}
					throw new UnauthorizedError();
				} catch (e) {
					if (e instanceof MailingError) throw e;
					log.error("Authentication error", {
						error: e instanceof Error ? e.message : "Unknown error",
						stack: e instanceof Error ? e.stack : undefined,
					});
					throw new UnauthorizedError("Authentication failed");
				}
			},
		},
		apiKeyAuth: {
			async resolve({ request: { headers }, log }) {
				try {
					const apiKey = headers.get("x-api-key");
					const traceId = crypto.randomUUID();
					log.set({ traceId, service: "mail" });
					const apiKeyResult = await validateApiKey(apiKey);
					if (apiKeyResult) {
						log.set({
							authType: "apiKey",
							activeOrganizationId: apiKeyResult.activeOrganizationId,
							userId: apiKeyResult.userId,
						});
						log.info("API key authentication successful");
						return { ...apiKeyResult, traceId, logger: log };
					}
					throw new UnauthorizedError();
				} catch (e) {
					if (e instanceof MailingError) throw e;
					log.error("Authentication error", {
						error: e instanceof Error ? e.message : "Unknown error",
						stack: e instanceof Error ? e.stack : undefined,
					});
					throw new UnauthorizedError("Authentication failed");
				}
			},
			detail: {
				security: [{ apiKey: [] }],
			},
		},
		auth: {
			async resolve({ request: { headers }, log }) {
				try {
					const apiKey = headers.get("x-api-key");
					const cookie = headers.get("cookie");
					const traceId = crypto.randomUUID();
					log.set({ traceId, service: "mail" });
					const apiKeyResult = await validateApiKey(apiKey);
					if (apiKeyResult) {
						log.set({
							authType: "apiKey",
							activeOrganizationId: apiKeyResult.activeOrganizationId,
							userId: apiKeyResult.userId,
						});
						log.info("API key authentication successful");
						return { ...apiKeyResult, traceId, logger: log };
					}
					const sessionResult = await validateSession(cookie);
					if (sessionResult) {
						log.set({
							authType: "session",
							activeOrganizationId: sessionResult.activeOrganizationId,
							userId: sessionResult.userId,
						});
						log.info("Session authentication successful");
						return { ...sessionResult, traceId, logger: log };
					}
					throw new UnauthorizedError();
				} catch (e) {
					if (e instanceof MailingError) throw e;
					log.error("Authentication error", {
						error: e instanceof Error ? e.message : "Unknown error",
						stack: e instanceof Error ? e.stack : undefined,
					});
					throw new UnauthorizedError("Authentication failed");
				}
			},
			detail: {
				security: [{ apiKey: [] }],
			},
		},
	});
