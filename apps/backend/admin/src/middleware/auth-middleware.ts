import { adminConfig } from "@reloop/admin/admin.config";
import {
	createAuthPlugin,
	SESSION_CACHE_REDIS_PREFIX,
} from "@reloop/auth/middleware";
import { PLATFORM_ADMIN_ROLE } from "@reloop/auth/roles";
import { RedisCache } from "@reloop/cache/redis-client";
import { Elysia } from "elysia";
import { log } from "evlog";
import { evlog } from "evlog/elysia";

if (adminConfig.NODE_ENV !== "production") {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const sessionRedis = new RedisCache(
	SESSION_CACHE_REDIS_PREFIX,
	5,
	adminConfig.REDIS_URL,
);

/**
 * Decision (issue #52): lean `AuthContext` omits email/name.
 * Admin audit rows store `actorUserId` only; email/name are resolved via
 * JOIN on `user` when listing audit logs (see audit.controllers.ts).
 * `isPlatformAdmin` is derived from `role === PLATFORM_ADMIN_ROLE`.
 *
 * Platform-admin routes use the shared `platformAdmin` macro.
 * Support chat uses scoped `supportSession` (any signed-in user, org optional).
 */
export const authMiddleware = new Elysia({
	name: "admin-auth-middleware",
})
	.use(evlog())
	.use(
		createAuthPlugin({
			baseUrl: adminConfig.BASE_URL,
			redis: sessionRedis,
			ttl: 5,
		}),
	)
	.macro({
		/**
		 * Any logged-in user (customer or platform admin). Org optional.
		 * Adds `isPlatformAdmin` for support-routing.
		 */
		supportSession: {
			async resolve({ status, request, log: requestLog }) {
				try {
					const cookie = request.headers.get("cookie");
					const sessionUrl = `${adminConfig.BASE_URL.replace(/\/$/, "")}/api/auth/v1/get-session`;
					const response = await fetch(sessionUrl, {
						method: "GET",
						headers: {
							"Content-Type": "application/json",
							Cookie: cookie || "",
						},
					});

					if (!response.ok) {
						return status(401, {
							message: "Unauthorized access",
							why: "A signed-in session is required for support chat",
							fix: "Sign in to your Reloop account and retry",
						});
					}

					const body = (await response.json()) as {
						user?: {
							id: string;
							role?: string | null;
							activeOrganizationId?: string | null;
						};
					} | null;

					const user = body?.user;
					if (!user?.id) {
						return status(401, {
							message: "Unauthorized access",
							why: "A signed-in session is required for support chat",
							fix: "Sign in to your Reloop account and retry",
						});
					}

					const role = user.role ?? "user";
					const isPlatformAdmin = role === PLATFORM_ADMIN_ROLE;
					const result = {
						userId: user.id,
						organizationId: user.activeOrganizationId ?? null,
						role,
						authType: "session" as const,
						isPlatformAdmin,
					};
					requestLog.set({ ...result, service: "admin" });
					return result;
				} catch (e) {
					log.error({
						message: "Support session authentication error",
						error: e instanceof Error ? e.message : "Unknown error",
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
