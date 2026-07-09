import { createId } from "@paralleldrive/cuid2";
import { adminConfig } from "@reloop/admin/admin.config";
import { Elysia } from "elysia";
import { evlog } from "evlog/elysia";
import { validatePlatformAdmin } from "./cookie-auth";

if (adminConfig.NODE_ENV !== "production") {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export const authMiddleware = new Elysia({
	name: "admin-auth-middleware",
})
	.use(evlog())
	.macro({
		platformAdmin: {
			async resolve({ status, request: { headers }, log }) {
				try {
					const cookie = headers.get("cookie");
					const traceId = `req_${createId()}`;
					log.set({ traceId, service: "admin" });
					const session = await validatePlatformAdmin(cookie);
					if (session) {
						const result = {
							userId: session.userId,
							role: session.role,
							email: session.email,
							name: session.name,
							organizationId: session.organizationId,
							authType: "session" as const,
						};
						log.set({ ...result });
						log.info("Platform admin authentication successful");
						return { ...result, traceId, logger: log };
					}
					return status(401, {
						message: "Unauthorized access",
						why: "Platform admin privileges are required",
						fix: "Sign in with a platform admin account",
					});
				} catch (e) {
					log.error("Platform admin authentication error", {
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
