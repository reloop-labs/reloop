import { createId } from "@paralleldrive/cuid2";
import { adminConfig } from "@reloop/admin/admin.config";
import { validatePlatformAdmin } from "@reloop/admin/middleware/cookie-auth";
import { Elysia } from "elysia";
import { log } from "evlog";
import { evlog } from "evlog/elysia";

if (adminConfig.NODE_ENV !== "production") {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export const authMiddleware = new Elysia({
	name: "admin-auth-middleware",
})
	.use(evlog())
	.macro({
		platformAdmin: {
			async resolve({ status, request, log: requestLog }) {
				try {
					const { headers, method, url } = request;
					const cookie = headers.get("cookie");
					const traceId = `req_${createId()}`;
					requestLog.set({ traceId, service: "admin" });
					const session = await validatePlatformAdmin(cookie);
					requestLog.set({ session });

					if (session) {
						const result = {
							userId: session.userId,
							role: session.role,
							email: session.email,
							name: session.name,
							organizationId: session.organizationId,
							authType: "session" as const,
						};
						requestLog.set({ ...result });
						return { ...result, traceId, logger: requestLog };
					}

					log.warn({
						message: "Platform admin authentication rejected",
						traceId,
						method,
						url,
						hasCookie: Boolean(cookie),
					});
					return status(401, {
						message: "Unauthorized access",
						why: "Platform admin privileges are required",
						fix: "Sign in with a platform admin account",
					});
				} catch (e) {
					log.error({
						message: "Platform admin authentication error",
						error: e instanceof Error ? e.message : "Unknown error",
						stack: e instanceof Error ? e.stack : undefined,
					});
					requestLog.error("Platform admin authentication error", {
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
