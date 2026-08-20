export { applySessionCacheEviction } from "./eviction/apply-session-cache-eviction";
export { evictAllSessionsForUser } from "./eviction/evict-all-sessions-for-user";
export { evictSessionByToken } from "./eviction/evict-session-by-token";
export { evictionEventFromAuthPath } from "./eviction/eviction-event-from-auth-path";
export { handleAuthLifecycleEviction } from "./eviction/handle-auth-lifecycle-eviction";
export { SESSION_CACHE_REDIS_PREFIX } from "./eviction/session-cache-redis-prefix";
export type { SessionEvictionEvent } from "./eviction/session-eviction-event";
export {
	isInsecureDefaultInternalSecret,
	KNOWN_INSECURE_INTERNAL_SECRETS,
	sanitizeInternalSecret,
} from "./internal-secret";
export {
	extractSessionToken,
	sessionTokenCacheKey,
	sessionUserIndexKey,
} from "./keys";

export {
	type AuthPlugin,
	createAuthPlugin,
} from "./plugin/create-auth-plugin";
export {
	applyResponseHeaders,
	buildRateLimitHeaders,
	buildReloopQuotaHeaders,
	RATE_LIMIT_HEADER,
	type RateLimitHeaderInput,
	RELOOP_QUOTA_HEADER,
	type ReloopQuotaHeaderInput,
} from "./rate-limit-headers";
export { createSessionCacheRedis } from "./redis/create-session-cache-redis";
export { resolveAuthRedis } from "./redis/resolve-auth-redis";
export {
	type RequireUserAgentOptions,
	requireUserAgentPlugin,
} from "./require-user-agent";
export { extractApiKey } from "./resolve/extract-api-key";
export { resolveApiKeyAuth } from "./resolve/resolve-api-key-auth";
export { resolveApiKeyInternalOrSession } from "./resolve/resolve-api-key-internal-or-session";
export { resolveApiKeyOrInternal } from "./resolve/resolve-api-key-or-internal";
export { resolveCollabAuth } from "./resolve/resolve-collab-auth";
export {
	resolveInternalAuth,
	timingSafeStringEqual,
} from "./resolve/resolve-internal-auth";
export { resolvePlatformAdmin } from "./resolve/resolve-platform-admin";
export { resolveSessionAuth } from "./resolve/resolve-session-auth";
export { resolveSessionAuthWithProfile } from "./resolve/resolve-session-auth-with-profile";
export { resolveSessionOrApiKey } from "./resolve/resolve-session-or-api-key";
export { resolveSupportSession } from "./resolve/resolve-support-session";
export type { ResolverDeps } from "./resolve/resolver-deps";

export {
	SECURE_HEADERS_VALUES,
	type SecureHeadersOptions,
	type SecureHeadersProfile,
	secureHeadersPlugin,
} from "./secure-headers";

export { resolveSession } from "./session/resolve-session";
export type { ResolveSessionOptions } from "./session/resolve-session-options";
export { resolveSessionWithProfile } from "./session/resolve-session-with-profile";

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
