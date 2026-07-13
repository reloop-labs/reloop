/**
 * `@reloop/auth/middleware` — shared Elysia auth plugin, pure resolvers,
 * and session-cache helpers for backend services.
 */

export { applySessionCacheEviction } from "./apply-session-cache-eviction";
export { createAuthPlugin, type AuthPlugin } from "./create-auth-plugin";
export { createSessionCacheRedis } from "./create-session-cache-redis";
export { evictAllSessionsForUser } from "./evict-all-sessions-for-user";
export { evictionEventFromAuthPath } from "./eviction-event-from-auth-path";
export { evictSessionByToken } from "./evict-session-by-token";
export { extractSessionToken } from "./extract-session-token";
export { handleAuthLifecycleEviction } from "./handle-auth-lifecycle-eviction";
export { resolveApiKeyAuth } from "./resolve-api-key-auth";
export { resolveApiKeyInternalOrSession } from "./resolve-api-key-internal-or-session";
export { resolveApiKeyOrInternal } from "./resolve-api-key-or-internal";
export { resolveAuthRedis } from "./resolve-auth-redis";
export { resolveCollabAuth } from "./resolve-collab-auth";
export { resolveInternalAuth } from "./resolve-internal-auth";
export { resolvePlatformAdmin } from "./resolve-platform-admin";
export { resolveSession } from "./resolve-session";
export { resolveSessionAuth } from "./resolve-session-auth";
export { resolveSessionAuthWithProfile } from "./resolve-session-auth-with-profile";
export type { ResolveSessionOptions } from "./resolve-session-options";
export { resolveSessionOrApiKey } from "./resolve-session-or-api-key";
export { resolveSessionWithProfile } from "./resolve-session-with-profile";
export { resolveSupportSession } from "./resolve-support-session";
export type { ResolverDeps } from "./resolver-deps";
export { SESSION_CACHE_REDIS_PREFIX } from "./session-cache-redis-prefix";
export type { SessionEvictionEvent } from "./session-eviction-event";
export { sessionTokenCacheKey } from "./session-token-cache-key";
export { sessionUserIndexKey } from "./session-user-index-key";
export {
	type AuthContext,
	type AuthContextWithProfile,
	type AuthMiddlewareConfig,
	type AuthRedis,
	DEFAULT_SESSION_CACHE_TTL_SECONDS,
	INTERNAL_ORG_ID_HEADER,
	INTERNAL_SECRET_HEADER,
	INTERNAL_USER_ID_HEADER,
	type SupportAuthContext,
} from "./types";
