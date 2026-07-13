import { Elysia } from "elysia";
import { resolveAuthRedis } from "./redis-factory";
import {
	resolveApiKeyAuth,
	resolveApiKeyOrInternal,
	resolveCollabAuth,
	resolveInternalAuth,
	resolvePlatformAdmin,
	resolveSessionOrApiKey,
	resolveSupportSession,
} from "./resolve";
import {
	type AuthMiddlewareConfig,
	DEFAULT_SESSION_CACHE_TTL_SECONDS,
} from "./types";

const UNAUTH = { message: "Authentication required" };

/**
 * Shared Elysia auth plugin factory.
 *
 * Pass `redisUrl` in production (package owns prefix + TTL).
 * Pass `redis` override in tests (e.g. MemoryRedis).
 * Optional `internalSecret` enables internal resolvers/macros.
 */
export function createAuthPlugin(config: AuthMiddlewareConfig) {
	const baseUrl = config.baseUrl;
	const redis = resolveAuthRedis(config);
	const ttl = config.ttl ?? DEFAULT_SESSION_CACHE_TTL_SECONDS;
	const internalSecret = config.internalSecret;
	const deps = { baseUrl, redis, ttl, internalSecret };

	return new Elysia({ name: "reloop-auth-middleware" }).macro({
		/**
		 * Session or API key; fail closed without active org.
		 * Does not accept internal auth even when internalSecret is set.
		 */
		auth: {
			async resolve({ status, request: { headers } }) {
				const ctx = await resolveSessionOrApiKey(headers, deps, {
					requireOrg: true,
				});
				if (!ctx?.organizationId) {
					return status(401, UNAUTH);
				}
				// Explicit fields so organizationId narrows to string for handlers.
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

		/**
		 * Session or API key; organization optional.
		 */
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

		/**
		 * API-key only. Organization comes from the key's owning org.
		 */
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

		/**
		 * Session only; requires Platform Admin. Org optional.
		 */
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

		/**
		 * Internal headers only (secret + user id + org id).
		 */
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

		/**
		 * API key, then internal. Fail closed on invalid key.
		 */
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

		/**
		 * Any signed-in session; org optional; isPlatformAdmin derived.
		 */
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

		/**
		 * Session or API key; fail-closed org; profile fields when session.
		 */
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
