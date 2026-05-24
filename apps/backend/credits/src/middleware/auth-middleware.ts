import { createId } from "@paralleldrive/cuid2";
import { creditsConfig } from "@reloop/credits/credits.config";
import { Elysia } from "elysia";
import { evlog } from "evlog/elysia";
import { validateSession } from "./cookie-auth";

if (creditsConfig.NODE_ENV !== "production") {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export const authMiddleware = new Elysia({
	name: "billing-auth-middleware",
})
	.use(evlog())
	.macro({
		cookieAuth: {
			async resolve({ status, request: { headers }, log }) {
				try {
					const cookie = headers.get("cookie");
					const traceId = `req_${createId()}`;
					log.set({ traceId, service: "credits" });
					const session = await validateSession(cookie);
					if (session) {
						const result = {
							userId: session.userId,
							organizationId: session.organizationId,
							authType: "session" as const,
						};
						log.set({
							...result,
						});
						log.info("Session authentication successful");
						return { ...result, traceId, logger: log };
					}
					return status(401, {
						message: "Unauthorized access",
						why: "Session cookie is missing, expired, or invalid",
						fix: "Authenticate by sending a valid session cookie",
					});
				} catch (e) {
					log.error("Authentication error", {
						error: e instanceof Error ? e.message : "Unknown error",
						stack: e instanceof Error ? e.stack : undefined,
					});
					return status(401, {
						message: "Unauthorized access",
						why: e instanceof Error ? e.message : "Unknown auth error",
						fix: "Verify credentials and retry",
					});
				}
			},
		},
	});
