import type { ApiKeyModel } from "@reloop/api-key/model/api-key.model";

export namespace ApiKeyTypes {
	export type ApiKeyResponse = typeof ApiKeyModel.apiKeyResponse.static;
	export type ApiKeyWithKeyResponse =
		typeof ApiKeyModel.apiKeyWithKeyResponse.static;
	export type ApiKeyListResponse = typeof ApiKeyModel.apiKeyListResponse.static;
	export type CreateApiKeyBody = typeof ApiKeyModel.createApiKeyBody.static;
	export type UpdateApiKeyBody = typeof ApiKeyModel.updateApiKeyBody.static;
	export type ApiKeyQuery = typeof ApiKeyModel.apiKeyQuery.static;
	export type ApiKeyNotFound = typeof ApiKeyModel.apiKeyNotFound.static;
	export type ApiKeyAlreadyExists =
		typeof ApiKeyModel.apiKeyAlreadyExists.static;
	export type InvalidApiKey = typeof ApiKeyModel.invalidApiKey.static;
	export type Unauthorized = typeof ApiKeyModel.unauthorized.static;
	export type Forbidden = typeof ApiKeyModel.forbidden.static;

	export interface ApiKeyData {
		id: string;
		name: string | null;
		start: string | null;
		prefix: string | null;
		key: string;
		organizationId: string;
		userId: string;
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
		createdBy: {
			id: string;
			name: string | null;
			image: string | null;
			email: string
		};
	}

	export interface CreateApiKeyRequest {
		name?: string;
		expiresAt?: string | null;
		refillInterval?: number;
		refillAmount?: number;
		enabled?: boolean;
		rateLimitEnabled?: boolean;
		rateLimitTimeWindow?: number;
		rateLimitMax?: number;
		permissions?: string | null;
		metadata?: string | null;
	}

	export interface UpdateApiKeyRequest {
		name?: string;
		expiresAt?: string | null;
		refillInterval?: number;
		refillAmount?: number;
		enabled?: boolean;
		rateLimitEnabled?: boolean;
		rateLimitTimeWindow?: number;
		rateLimitMax?: number;
		permissions?: string | null;
		metadata?: string | null;
	}

	export interface ApiKeyListQuery {
		page?: number;
		limit?: number;
		enabled?: boolean;
	}

	export type UsageStatsResponse =
		typeof ApiKeyModel.usageStatsResponse.static;
	export type SuccessResponse = typeof ApiKeyModel.successResponse.static;
}
