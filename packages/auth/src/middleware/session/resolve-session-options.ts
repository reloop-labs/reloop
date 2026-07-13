import type { AuthRedis } from "@reloop/auth/middleware/types";

export type ResolveSessionOptions = {
	baseUrl: string;
	redis: AuthRedis;
	ttl: number;

	requireOrg: boolean;
};
