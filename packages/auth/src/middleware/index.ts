export { applySessionCacheEviction } from "@reloop/auth/middleware/eviction/apply-session-cache-eviction";
export { evictAllSessionsForUser } from "@reloop/auth/middleware/eviction/evict-all-sessions-for-user";
export { evictSessionByToken } from "@reloop/auth/middleware/eviction/evict-session-by-token";
export { evictionEventFromAuthPath } from "@reloop/auth/middleware/eviction/eviction-event-from-auth-path";
export { handleAuthLifecycleEviction } from "@reloop/auth/middleware/eviction/handle-auth-lifecycle-eviction";
export { SESSION_CACHE_REDIS_PREFIX } from "@reloop/auth/middleware/eviction/session-cache-redis-prefix";
export type { SessionEvictionEvent } from "@reloop/auth/middleware/eviction/session-eviction-event";

export {
	extractSessionToken,
	sessionTokenCacheKey,
	sessionUserIndexKey,
} from "@reloop/auth/middleware/keys";

export {
	type AuthPlugin,
	createAuthPlugin,
} from "@reloop/auth/middleware/plugin/create-auth-plugin";

export { createSessionCacheRedis } from "@reloop/auth/middleware/redis/create-session-cache-redis";
export { resolveAuthRedis } from "@reloop/auth/middleware/redis/resolve-auth-redis";

export { resolveApiKeyAuth } from "@reloop/auth/middleware/resolve/resolve-api-key-auth";
export { resolveApiKeyInternalOrSession } from "@reloop/auth/middleware/resolve/resolve-api-key-internal-or-session";
export { resolveApiKeyOrInternal } from "@reloop/auth/middleware/resolve/resolve-api-key-or-internal";
export { resolveCollabAuth } from "@reloop/auth/middleware/resolve/resolve-collab-auth";
export { resolveInternalAuth } from "@reloop/auth/middleware/resolve/resolve-internal-auth";
export { resolvePlatformAdmin } from "@reloop/auth/middleware/resolve/resolve-platform-admin";
export { resolveSessionAuth } from "@reloop/auth/middleware/resolve/resolve-session-auth";
export { resolveSessionAuthWithProfile } from "@reloop/auth/middleware/resolve/resolve-session-auth-with-profile";
export { resolveSessionOrApiKey } from "@reloop/auth/middleware/resolve/resolve-session-or-api-key";
export { resolveSupportSession } from "@reloop/auth/middleware/resolve/resolve-support-session";
export type { ResolverDeps } from "@reloop/auth/middleware/resolve/resolver-deps";

export { resolveSession } from "@reloop/auth/middleware/session/resolve-session";
export type { ResolveSessionOptions } from "@reloop/auth/middleware/session/resolve-session-options";
export { resolveSessionWithProfile } from "@reloop/auth/middleware/session/resolve-session-with-profile";

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
} from "@reloop/auth/middleware/types";
