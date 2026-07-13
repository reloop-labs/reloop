/**
 * `@reloop/auth/middleware` — shared Elysia auth plugin factory.
 * Not yet mounted by services (pilot migration is a later ticket).
 */

export {
	extractSessionToken,
	sessionTokenCacheKey,
	sessionUserIndexKey,
} from "./keys";
export { type AuthPlugin, createAuthPlugin } from "./plugin";
export { resolveSession } from "./session";
export {
	type AuthContext,
	type AuthMiddlewareConfig,
	type AuthRedis,
	DEFAULT_SESSION_CACHE_TTL_SECONDS,
} from "./types";
