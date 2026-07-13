import type { AuthRedis } from "./types";

export type ResolveSessionOptions = {
	baseUrl: string;
	redis: AuthRedis;
	ttl: number;
	/** When true, require activeOrganizationId (fail closed). */
	requireOrg: boolean;
};
