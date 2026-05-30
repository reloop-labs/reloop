import { AuthErrors } from "@be/template/error/template.error";
import { createId } from "@paralleldrive/cuid2";
import { Elysia } from "elysia";
import { evlog } from "evlog/elysia";
import { validateApiKey } from "./api-key-auth";
import { validateSession } from "./cookie-auth";

export const authMiddleware = new Elysia({ name: "better-auth" })
	.use(evlog())
	.macro({
		cookieAuth: {
			async resolve({ request: { headers }, log }) {
				const cookie = headers.get("cookie");
				const sessionResult = await validateSession(cookie);
				if (sessionResult) {
					const traceId = `req_${createId()}`;
					log.set({
						traceId,
						service: "template",
						user: sessionResult.userId,
						organizationId: sessionResult.organizationId,
					});
					log.info("Session authentication successful");
					return {
						userId: sessionResult.userId,
						organizationId: sessionResult.organizationId,
						authType: "auth" as const,
						traceId,
					};
				}
				throw AuthErrors.unauthorized();
			},
		},
		apiKeyAuth: {
			async resolve({ request: { headers }, log }) {
				const apiKey = headers.get("x-api-key");
				const apiKeyResult = await validateApiKey(apiKey);
				if (apiKeyResult) {
					const traceId = `req_${createId()}`;
					log.set({
						traceId,
						service: "template",
						user: apiKeyResult.userId,
						organizationId: apiKeyResult.organizationId,
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
				throw AuthErrors.unauthorized();
			},
			detail: {
				security: [{ apiKey: [] }],
			},
		},
		auth: {
			async resolve({ request: { headers }, log }) {
				const apiKey = headers.get("x-api-key");
				const cookie = headers.get("cookie");

				if (apiKey) {
					try {
						const apiKeyResult = await validateApiKey(apiKey);
						if (apiKeyResult) {
							const traceId = `req_${createId()}`;
							log.set({
								traceId,
								service: "template",
								user: apiKeyResult.userId,
								organizationId: apiKeyResult.organizationId,
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
					} catch (error) {
						log.error("API key validation error", {
							error: error instanceof Error ? error.message : "Unknown error",
						});
					}
				}

				if (cookie) {
					try {
						const sessionResult = await validateSession(cookie);
						if (sessionResult) {
							const traceId = `req_${createId()}`;
							log.set({
								traceId,
								service: "template",
								user: sessionResult.userId,
								organizationId: sessionResult.organizationId,
							});
							log.info("Session authentication successful");
							return {
								userId: sessionResult.userId,
								organizationId: sessionResult.organizationId,
								authType: "auth" as const,
								traceId,
							};
						}
					} catch (error) {
						log.error("Session validation error", {
							error: error instanceof Error ? error.message : "Unknown error",
						});
					}
				}

				throw AuthErrors.unauthorized();
			},
			detail: {
				security: [{ apiKey: [] }],
			},
		},
	});
