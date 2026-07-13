import type { AuthRedis } from "../types";

export type ResolverDeps = {
	baseUrl: string;
	redis: AuthRedis;
	ttl: number;
	internalSecret?: string;
};
