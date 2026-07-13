export type AuthContext = {
	userId: string;
	organizationId: string | null;

	platformRole: string | null;
	authType: "session" | "apikey" | "internal";

	apiKeyId?: string;
};

export type AuthContextWithProfile = AuthContext & {
	userEmail?: string;
	userName?: string;
	userImage?: string;
};

export type SupportAuthContext = AuthContext & {
	isPlatformAdmin: boolean;
	userEmail?: string;
	userName?: string;
	userImage?: string;
};

export type AuthRedis = {
	get<T>(key: string): Promise<T | undefined>;
	set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
	delete(key: string): Promise<void>;
};

export type AuthMiddlewareConfig = {

	baseUrl: string;

	redisUrl?: string;

	redis?: AuthRedis;

	ttl?: number;

	internalSecret?: string;
};

export const DEFAULT_SESSION_CACHE_TTL_SECONDS = 5;

export const INTERNAL_SECRET_HEADER = "x-internal-secret";
export const INTERNAL_USER_ID_HEADER = "x-user-id";
export const INTERNAL_ORG_ID_HEADER = "x-organization-id";
