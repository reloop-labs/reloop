import { createId } from "@paralleldrive/cuid2";
import { adminConfig } from "@reloop/admin/admin.config";
import { validatePlatformAdmin } from "@reloop/admin/middleware/cookie-auth";
import { Elysia } from "elysia";
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
			async resolve({ status, request, log }) {
				try {
					const { headers, method, url } = request;
					const cookie = headers.get("cookie");
					const traceId = `req_${createId()}`;
					log.set({ traceId, service: "admin" });

					console.log("[admin-auth] incoming request", {
						traceId,
						method,
						url,
						hasCookie: Boolean(cookie),
						origin: headers.get("origin"),
						referer: headers.get("referer"),
						host: headers.get("host"),
					});

					const session = await validatePlatformAdmin(cookie);
					log.set({ session });

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
						console.log("[admin-auth] authorized", {
							traceId,
							userId: result.userId,
							email: result.email,
							role: result.role,
						});
						return { ...result, traceId, logger: log };
					}

					console.warn("[admin-auth] rejected (401)", {
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
					console.error("[admin-auth] error", {
						error: e instanceof Error ? e.message : "Unknown error",
						stack: e instanceof Error ? e.stack : undefined,
					});
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
