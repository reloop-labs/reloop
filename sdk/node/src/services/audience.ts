import type { HTTPClient } from "../client.js";
import type {
	AudienceGroupListResponse,
	AudienceGroupQuery,
	AudienceGroupResponse,
	AudienceListResponse,
	AudienceQuery,
	AudienceResponse,
	BulkImportAudiencesRequest,
	BulkImportResponse,
	CreateAudienceGroupRequest,
	CreateAudienceRequest,
	SearchAudiencesQuery,
	SubscribeAudienceRequest,
	UnsubscribeAudienceRequest,
	UpdateAudienceGroupRequest,
	UpdateAudienceRequest,
} from "../types.js";

export class AudienceService {
	constructor(private client: HTTPClient) {}

	/**
	 * Create a new audience
	 * @param data Audience creation data
	 * @returns Promise resolving to the created audience
	 */
	async create(data: CreateAudienceRequest): Promise<AudienceResponse> {
		return this.client.post<AudienceResponse>("/api/audience/v1/add", data);
	}

	/**
	 * Get an audience by ID
	 * @param id Audience ID
	 * @returns Promise resolving to the audience
	 */
	async get(id: string): Promise<AudienceResponse> {
		return this.client.get<AudienceResponse>(
			`/api/audience/v1/get/${encodeURIComponent(id)}`,
		);
	}

	/**
	 * List audiences with optional filters
	 * @param query Query parameters for filtering and pagination
	 * @returns Promise resolving to the list of audiences
	 */
	async list(query?: AudienceQuery): Promise<AudienceListResponse> {
		return this.client.get<AudienceListResponse>(
			"/api/audience/v1/list",
			query,
		);
	}

	/**
	 * Update an audience
	 * @param id Audience ID
	 * @param data Audience update data
	 * @returns Promise resolving to the updated audience
	 */
	async update(
		id: string,
		data: UpdateAudienceRequest,
	): Promise<AudienceResponse> {
		return this.client.put<AudienceResponse>(
			`/api/audience/v1/update/${encodeURIComponent(id)}`,
			data,
		);
	}

	/**
	 * Delete an audience
	 * @param id Audience ID
	 * @returns Promise resolving to a success message
	 */
	async delete(id: string): Promise<{ message: string }> {
		return this.client.delete<{ message: string }>(
			`/api/audience/v1/${encodeURIComponent(id)}`,
		);
	}

	/**
	 * Bulk import audiences
	 * @param data Bulk import data
	 * @returns Promise resolving to bulk import results
	 */
	async bulkImport(
		data: BulkImportAudiencesRequest,
	): Promise<BulkImportResponse> {
		return this.client.post<BulkImportResponse>(
			"/api/audience/v1/bulk-import",
			data,
		);
	}

	/**
	 * Subscribe an audience
	 * @param id Audience ID
	 * @param data Optional subscription data with reason
	 * @returns Promise resolving to the updated audience
	 */
	async subscribe(
		id: string,
		data?: SubscribeAudienceRequest,
	): Promise<AudienceResponse> {
		return this.client.post<AudienceResponse>(
			`/api/audience/v1/${encodeURIComponent(id)}/subscribe`,
			data,
		);
	}

	/**
	 * Unsubscribe an audience
	 * @param id Audience ID
	 * @param data Optional unsubscription data with reason
	 * @returns Promise resolving to the updated audience
	 */
	async unsubscribe(
		id: string,
		data?: UnsubscribeAudienceRequest,
	): Promise<AudienceResponse> {
		return this.client.post<AudienceResponse>(
			`/api/audience/v1/${encodeURIComponent(id)}/unsubscribe`,
			data,
		);
	}

	/**
	 * Search audiences
	 * @param query Search query parameters
	 * @returns Promise resolving to the list of matching audiences
	 */
	async search(query: SearchAudiencesQuery): Promise<AudienceListResponse> {
		return this.client.get<AudienceListResponse>(
			"/api/audience/v1/search",
			query,
		);
	}

	/**
	 * Create a new audience group
	 * @param data Audience group creation data
	 * @returns Promise resolving to the created audience group
	 */
	async createGroup(
		data: CreateAudienceGroupRequest,
	): Promise<AudienceGroupResponse> {
		return this.client.post<AudienceGroupResponse>(
			"/api/audience/v1/groups/add",
			data,
		);
	}

	/**
	 * Get an audience group by ID
	 * @param id Audience group ID
	 * @returns Promise resolving to the audience group
	 */
	async getGroup(id: string): Promise<AudienceGroupResponse> {
		return this.client.get<AudienceGroupResponse>(
			`/api/audience/v1/groups/get/${encodeURIComponent(id)}`,
		);
	}

	/**
	 * List audience groups with optional filters
	 * @param query Query parameters for filtering and pagination
	 * @returns Promise resolving to the list of audience groups
	 */
	async listGroups(
		query?: AudienceGroupQuery,
	): Promise<AudienceGroupListResponse> {
		return this.client.get<AudienceGroupListResponse>(
			"/api/audience/v1/groups/list",
			query,
		);
	}

	/**
	 * Update an audience group
	 * @param id Audience group ID
	 * @param data Audience group update data
	 * @returns Promise resolving to the updated audience group
	 */
	async updateGroup(
		id: string,
		data: UpdateAudienceGroupRequest,
	): Promise<AudienceGroupResponse> {
		return this.client.put<AudienceGroupResponse>(
			`/api/audience/v1/groups/update/${encodeURIComponent(id)}`,
			data,
		);
	}

	/**
	 * Delete an audience group
	 * @param id Audience group ID
	 * @returns Promise resolving to a success message
	 */
	async deleteGroup(id: string): Promise<{ message: string }> {
		return this.client.delete<{ message: string }>(
			`/api/audience/v1/groups/delete/${encodeURIComponent(id)}`,
		);
	}
}
