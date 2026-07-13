/**
 * Canonical auth context returned by every shared middleware macro.
 * `organizationId` is null only on authNoOrg / platformAdmin paths.
 */
export type AuthContext = {
	userId: string;
	organizationId: string | null;
	role: string | null;
	authType: "session" | "apikey";
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
	/** Shared Redis used for short-TTL session cache + API-key cache. */
	redis: AuthRedis;
	/** Session-cache TTL in seconds. Default 5. */
	ttl?: number;
};

export const DEFAULT_SESSION_CACHE_TTL_SECONDS = 5;
