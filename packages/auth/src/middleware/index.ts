/**
 * `@reloop/auth/middleware` — shared Elysia auth plugin, pure resolvers,
 * and session-cache helpers for backend services.
 */

export {
	applySessionCacheEviction,
	evictAllSessionsForUser,
	evictionEventFromAuthPath,
	evictSessionByToken,
	handleAuthLifecycleEviction,
	SESSION_CACHE_REDIS_PREFIX,
	type SessionEvictionEvent,
} from "./eviction";
export {
	extractSessionToken,
	sessionTokenCacheKey,
	sessionUserIndexKey,
} from "./keys";
export { type AuthPlugin, createAuthPlugin } from "./plugin";
export {
	createSessionCacheRedis,
	resolveAuthRedis,
} from "./redis-factory";
export {
	type ResolverDeps,
	resolveApiKeyAuth,
	resolveApiKeyInternalOrSession,
	resolveApiKeyOrInternal,
	resolveCollabAuth,
	resolveInternalAuth,
	resolvePlatformAdmin,
	resolveSessionAuth,
	resolveSessionAuthWithProfile,
	resolveSessionOrApiKey,
	resolveSupportSession,
} from "./resolve";
export { resolveSession, resolveSessionWithProfile } from "./session";
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
