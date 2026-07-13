import { resolveAuthRedis } from "@reloop/auth/middleware/redis/resolve-auth-redis";
import { resolveApiKeyAuth } from "@reloop/auth/middleware/resolve/resolve-api-key-auth";
import { resolveApiKeyOrInternal } from "@reloop/auth/middleware/resolve/resolve-api-key-or-internal";
import { resolveCollabAuth } from "@reloop/auth/middleware/resolve/resolve-collab-auth";
import { resolveInternalAuth } from "@reloop/auth/middleware/resolve/resolve-internal-auth";
import { resolvePlatformAdmin } from "@reloop/auth/middleware/resolve/resolve-platform-admin";
import { resolveSessionOrApiKey } from "@reloop/auth/middleware/resolve/resolve-session-or-api-key";
import { resolveSupportSession } from "@reloop/auth/middleware/resolve/resolve-support-session";
import {
	type AuthMiddlewareConfig,
	DEFAULT_SESSION_CACHE_TTL_SECONDS,
} from "@reloop/auth/middleware/types";
import { Elysia } from "elysia";

const UNAUTH = { message: "Authentication required" };

export function createAuthPlugin(config: AuthMiddlewareConfig) {
	const baseUrl = config.baseUrl;
	const redis = resolveAuthRedis(config);
	const ttl = config.ttl ?? DEFAULT_SESSION_CACHE_TTL_SECONDS;
	const internalSecret = config.internalSecret;
	const deps = { baseUrl, redis, ttl, internalSecret };

	return new Elysia({ name: "reloop-auth-middleware" }).macro({
		auth: {
			async resolve({ status, request: { headers } }) {
				const ctx = await resolveSessionOrApiKey(headers, deps, {
					requireOrg: true,
				});
				if (!ctx?.organizationId) {
					return status(401, UNAUTH);
				}
				return {
					userId: ctx.userId,
					organizationId: ctx.organizationId,
					platformRole: ctx.platformRole,
					authType: ctx.authType,
					...(ctx.apiKeyId ? { apiKeyId: ctx.apiKeyId } : {}),
				};
			},
			detail: {
				security: [{ apiKey: [] }],
			},
		},

		authNoOrg: {
			async resolve({ status, request: { headers } }) {
				const ctx = await resolveSessionOrApiKey(headers, deps, {
					requireOrg: false,
				});
				if (!ctx) {
					return status(401, UNAUTH);
				}
				return {
					userId: ctx.userId,
					organizationId: ctx.organizationId,
					platformRole: ctx.platformRole,
					authType: ctx.authType,
					...(ctx.apiKeyId ? { apiKeyId: ctx.apiKeyId } : {}),
				};
			},
		},

		authKey: {
			async resolve({ status, request: { headers } }) {
				const result = await resolveApiKeyAuth(headers, deps, {
					requireOrg: true,
				});
				if (!result.ok || !result.ctx.organizationId) {
					return status(401, UNAUTH);
				}
				return {
					userId: result.ctx.userId,
					organizationId: result.ctx.organizationId,
					platformRole: result.ctx.platformRole,
					authType: result.ctx.authType,
					apiKeyId: result.ctx.apiKeyId,
				};
			},
			detail: {
				security: [{ apiKey: [] }],
			},
		},

		authAdmin: {
			async resolve({ status, request: { headers } }) {
				const ctx = await resolvePlatformAdmin(headers, deps);
				if (!ctx) {
					return status(401, {
						message: "Unauthorized access",
						why: "Platform admin privileges are required",
						fix: "Sign in with a platform admin account",
					});
				}
				return {
					userId: ctx.userId,
					organizationId: ctx.organizationId,
					platformRole: ctx.platformRole,
					authType: ctx.authType,
				};
			},
		},

		authInternal: {
			async resolve({ status, request: { headers } }) {
				const ctx = resolveInternalAuth(headers, deps);
				if (!ctx?.organizationId) {
					return status(401, UNAUTH);
				}
				return {
					userId: ctx.userId,
					organizationId: ctx.organizationId,
					platformRole: ctx.platformRole,
					authType: ctx.authType,
				};
			},
		},

		authKeyInternal: {
			async resolve({ status, request: { headers } }) {
				const ctx = await resolveApiKeyOrInternal(headers, deps);
				if (!ctx?.organizationId) {
					return status(401, UNAUTH);
				}
				return {
					userId: ctx.userId,
					organizationId: ctx.organizationId,
					platformRole: ctx.platformRole,
					authType: ctx.authType,
					...(ctx.apiKeyId ? { apiKeyId: ctx.apiKeyId } : {}),
				};
			},
			detail: {
				security: [{ apiKey: [] }],
			},
		},

		authSupport: {
			async resolve({ status, request: { headers } }) {
				const ctx = await resolveSupportSession(headers, deps);
				if (!ctx) {
					return status(401, {
						message: "Unauthorized access",
						why: "A signed-in session is required for support chat",
						fix: "Sign in to your Reloop account and retry",
					});
				}
				return {
					userId: ctx.userId,
					organizationId: ctx.organizationId,
					platformRole: ctx.platformRole,
					authType: ctx.authType,
					isPlatformAdmin: ctx.isPlatformAdmin,
					userEmail: ctx.userEmail,
					userName: ctx.userName,
					userImage: ctx.userImage,
				};
			},
		},

		authCollab: {
			async resolve({ status, request: { headers } }) {
				const ctx = await resolveCollabAuth(headers, deps);
				if (!ctx?.organizationId) {
					return status(401, UNAUTH);
				}
				return {
					userId: ctx.userId,
					organizationId: ctx.organizationId,
					platformRole: ctx.platformRole,
					authType: ctx.authType,
					userEmail: ctx.userEmail,
					userName: ctx.userName,
					userImage: ctx.userImage,
					...(ctx.apiKeyId ? { apiKeyId: ctx.apiKeyId } : {}),
				};
			},
			detail: {
				security: [{ apiKey: [] }],
			},
		},
	});
}

export type AuthPlugin = ReturnType<typeof createAuthPlugin>;
