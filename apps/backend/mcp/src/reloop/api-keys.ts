import type { ErrorCodeMap } from "../errors/reloop-error";
import type { ReloopClient } from "./client";
import { apiKeyEndpoints } from "./endpoints";
import type {
	ApiKey,
	ApiKeyListResponse,
	ApiKeyWithSecret,
	DeleteApiKeyResponse,
	ListApiKeysQuery,
} from "./types";

const API_KEY_CODES: ErrorCodeMap = { 404: "api_key_not_found" };

export class ApiKeysApi {
	readonly #client: ReloopClient;

	constructor(client: ReloopClient) {
		this.#client = client;
	}

	list(query: ListApiKeysQuery = {}): Promise<ApiKeyListResponse> {
		return this.#client.request<ApiKeyListResponse>({
			method: "GET",
			path: apiKeyEndpoints.collection,
			query: {
				page: query.page,
				limit: query.limit,
				enabled: query.enabled,
				q: query.q,
			},
			codes: API_KEY_CODES,
			idempotent: true,
		});
	}

	retrieve(id: string): Promise<ApiKey> {
		return this.#client.request<ApiKey>({
			method: "GET",
			path: apiKeyEndpoints.byId(id),
			codes: API_KEY_CODES,
			idempotent: true,
		});
	}

	create(name: string): Promise<ApiKeyWithSecret> {
		return this.#client.request<ApiKeyWithSecret>({
			method: "POST",
			path: apiKeyEndpoints.collection,
			body: { name },
			codes: API_KEY_CODES,
			idempotent: false,
		});
	}

	rename(id: string, name: string): Promise<ApiKey> {
		return this.#client.request<ApiKey>({
			method: "PATCH",
			path: apiKeyEndpoints.byId(id),
			body: { name },
			codes: API_KEY_CODES,
			idempotent: true,
		});
	}

	rotate(id: string): Promise<ApiKeyWithSecret> {
		return this.#client.request<ApiKeyWithSecret>({
			method: "POST",
			path: apiKeyEndpoints.rotate(id),
			codes: API_KEY_CODES,
			idempotent: false,
		});
	}

	enable(id: string): Promise<ApiKey> {
		return this.#client.request<ApiKey>({
			method: "POST",
			path: apiKeyEndpoints.enable(id),
			codes: API_KEY_CODES,
			idempotent: true,
		});
	}

	disable(id: string): Promise<ApiKey> {
		return this.#client.request<ApiKey>({
			method: "POST",
			path: apiKeyEndpoints.disable(id),
			codes: API_KEY_CODES,
			idempotent: true,
		});
	}

	remove(id: string): Promise<DeleteApiKeyResponse> {
		return this.#client.request<DeleteApiKeyResponse>({
			method: "DELETE",
			path: apiKeyEndpoints.byId(id),
			codes: API_KEY_CODES,
			idempotent: true,
		});
	}
}
