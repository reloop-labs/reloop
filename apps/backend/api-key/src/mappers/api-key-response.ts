import type { ApiKeyTypes } from "@reloop/api-key/types/api-key.type";

/** Row shape needed to build the public API Key DTO (optional creator relation). */
export type ApiKeyResponseSource = {
	id: string;
	name: string | null;
	start: string | null;
	prefix: string | null;
	refillInterval: number | null;
	refillAmount: number | null;
	lastRefillAt: Date | null;
	enabled: boolean;
	rateLimitEnabled: boolean;
	rateLimitTimeWindow: number;
	rateLimitMax: number;
	requestCount: number;
	remaining: number | null;
	lastRequest: Date | null;
	expiresAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
	permissions: string | null;
	metadata: string | null;
	user?: {
		id: string;
		name: string | null;
		image: string | null;
		email: string;
	} | null;
};

/** Full management response (no secret). */
export function toApiKeyResponse(
	row: ApiKeyResponseSource,
	eventId: string,
): ApiKeyTypes.ApiKeyResponse {
	return {
		id: row.id,
		name: row.name,
		start: row.start,
		prefix: row.prefix,
		refillInterval: row.refillInterval,
		refillAmount: row.refillAmount,
		lastRefillAt: row.lastRefillAt?.toISOString() ?? null,
		enabled: row.enabled,
		rateLimitEnabled: row.rateLimitEnabled,
		rateLimitTimeWindow: row.rateLimitTimeWindow,
		rateLimitMax: row.rateLimitMax,
		requestCount: row.requestCount,
		remaining: row.remaining,
		lastRequest: row.lastRequest?.toISOString() ?? null,
		expiresAt: row.expiresAt?.toISOString() ?? null,
		createdAt: row.createdAt.toISOString(),
		updatedAt: row.updatedAt.toISOString(),
		permissions: row.permissions,
		metadata: row.metadata,
		createdBy: row.user
			? {
					id: row.user.id,
					name: row.user.name,
					image: row.user.image,
					email: row.user.email,
				}
			: undefined,
		object: "api_key" as const,
		event: eventId,
	};
}

/** Create/rotate response — includes plaintext secret once. */
export function toApiKeyWithKeyResponse(
	row: Pick<
		ApiKeyResponseSource,
		"id" | "name" | "enabled" | "createdAt" | "updatedAt" | "permissions"
	>,
	plaintextKey: string,
	eventId: string,
): ApiKeyTypes.ApiKeyWithKeyResponse {
	return {
		id: row.id,
		name: row.name,
		key: plaintextKey,
		enabled: row.enabled,
		createdAt: row.createdAt.toISOString(),
		updatedAt: row.updatedAt.toISOString(),
		permissions: row.permissions,
		object: "api_key" as const,
		event: eventId,
	};
}
