import type { HTTPClient } from "../client.js";
import type {
	ApiKey,
	CreateApiKeyRequest,
	ListApiKeysQuery,
	ListApiKeysResponse,
	UpdateApiKeyRequest,
} from "../types.js";

export class ApiKeyService {
	constructor(private client: HTTPClient) {}

	/**
	 * Create a new API key
	 */
	async create(data: CreateApiKeyRequest): Promise<ApiKey> {
		return this.client.post<ApiKey>("/api-key/v1/", data);
	}

	/**
	 * List all API keys
	 */
	async list(query?: ListApiKeysQuery): Promise<ListApiKeysResponse> {
		return this.client.get<ListApiKeysResponse>(
			"/api-key/v1/",
			query as Record<string, unknown>,
		);
	}

	/**
	 * Get an API key by ID
	 */
	async get(id: string): Promise<ApiKey> {
		return this.client.get<ApiKey>(`/api-key/v1/${id}`);
	}

	/**
	 * Update an API key
	 */
	async update(id: string, data: UpdateApiKeyRequest): Promise<ApiKey> {
		return this.client.patch<ApiKey>(`/api-key/v1/${id}`, data);
	}

	/**
	 * Delete an API key
	 */
	async delete(id: string): Promise<{ success: boolean }> {
		return this.client.delete<{ success: boolean }>(`/api-key/v1/${id}`);
	}

	/**
	 * Rotate an API key's secret
	 */
	async rotate(id: string): Promise<ApiKey> {
		return this.client.post<ApiKey>(`/api-key/v1/rotate/${id}`);
	}

	/**
	 * Enable a disabled API key
	 */
	async enable(id: string): Promise<ApiKey> {
		return this.client.post<ApiKey>(`/api-key/v1/enable/${id}`);
	}

	/**
	 * Disable an API key
	 */
	async disable(id: string): Promise<ApiKey> {
		return this.client.post<ApiKey>(`/api-key/v1/disable/${id}`);
	}
}
