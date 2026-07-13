/**
 * Canonical auth context returned by every shared middleware macro.
 * `organizationId` is null only on authNoOrg / authAdmin / authSupport paths.
 */
export type AuthContext = {
	userId: string;
	organizationId: string | null;
	/** Platform user role (`user` / `super-admin`), not organization membership. */
	platformRole: string | null;
	authType: "session" | "apikey" | "internal";
	/** Present when authenticated via API key (audit). */
	apiKeyId?: string;
};

/** Lean AuthContext plus optional profile fields from get-session. */
export type AuthContextWithProfile = AuthContext & {
	userEmail?: string;
	userName?: string;
	userImage?: string;
};

/** AuthContext for support chat (any signed-in user). */
export type SupportAuthContext = AuthContext & {
	isPlatformAdmin: boolean;
	userEmail?: string;
	userName?: string;
	userImage?: string;
};

/** Minimal Redis surface used by session caching (satisfied by RedisCache). */
export type AuthRedis = {
	get<T>(key: string): Promise<T | undefined>;
	set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
	delete(key: string): Promise<void>;
};

export type AuthMiddlewareConfig = {
	/** Base URL of the auth service (e.g. https://local.reloop.sh). */
	baseUrl: string;
	/**
	 * Redis URL for the shared session-validation cache.
	 * Package constructs RedisCache with {@link SESSION_CACHE_REDIS_PREFIX}.
	 * Omit when providing `redis` (tests).
	 */
	redisUrl?: string;
	/**
	 * Injected Redis client. When set, wins over `redisUrl` (MemoryRedis in tests).
	 * Production services should pass `redisUrl` instead.
	 */
	redis?: AuthRedis;
	/** Session-cache TTL in seconds. Default 5. */
	ttl?: number;
	/**
	 * Shared internal service secret. Required for `authInternal` /
	 * `authKeyInternal` and pure internal resolvers.
	 */
	internalSecret?: string;
};

export const DEFAULT_SESSION_CACHE_TTL_SECONDS = 5;

export const INTERNAL_SECRET_HEADER = "x-internal-secret";
export const INTERNAL_USER_ID_HEADER = "x-user-id";
export const INTERNAL_ORG_ID_HEADER = "x-organization-id";
