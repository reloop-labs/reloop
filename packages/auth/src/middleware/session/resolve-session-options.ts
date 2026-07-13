import type { AuthRedis } from "../types";

export type ResolveSessionOptions = {
	baseUrl: string;
	redis: AuthRedis;
	ttl: number;

	requireOrg: boolean;
};
