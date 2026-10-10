import type { AuthRedis } from "@reloop/auth/middleware/types";

export type ResolverDeps = {
	baseUrl: string;
	redis: AuthRedis;
	ttl: number;
	internalSecret?: string;
	/** Expected OAuth access-token audience. Defaults to `<baseUrl>/mcp`. */
	oauthResource?: string;
};
