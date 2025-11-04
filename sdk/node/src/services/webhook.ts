import type { HTTPClient } from "../client.js";
import type {
	CreateWebhookRequest,
	UpdateWebhookRequest,
	WebhookListResponse,
	WebhookQuery,
	WebhookResponse,
} from "../types.js";

export class WebhookService {
	constructor(private client: HTTPClient) {}

	/**
	 * Create a new webhook
	 * @param data Webhook creation data
	 * @returns Promise resolving to the created webhook
	 */
	async create(data: CreateWebhookRequest): Promise<WebhookResponse> {
		return this.client.post<WebhookResponse>("/api/webhook/v1/add", data);
	}

	/**
	 * Get a webhook by ID
	 * @param id Webhook ID
	 * @returns Promise resolving to the webhook
	 */
	async get(id: string): Promise<WebhookResponse> {
		return this.client.get<WebhookResponse>(
			`/api/webhook/v1/${encodeURIComponent(id)}`,
		);
	}

	/**
	 * List webhooks with optional filters
	 * @param query Query parameters for filtering and pagination
	 * @returns Promise resolving to the list of webhooks
	 */
	async list(query?: WebhookQuery): Promise<WebhookListResponse> {
		return this.client.get<WebhookListResponse>("/api/webhook/v1/list", query);
	}

	/**
	 * Update a webhook
	 * @param id Webhook ID
	 * @param data Webhook update data
	 * @returns Promise resolving to the updated webhook
	 */
	async update(
		id: string,
		data: UpdateWebhookRequest,
	): Promise<WebhookResponse> {
		return this.client.put<WebhookResponse>(
			`/api/webhook/v1/${encodeURIComponent(id)}`,
			data,
		);
	}

	/**
	 * Delete a webhook
	 * @param id Webhook ID
	 * @returns Promise resolving to a success message
	 */
	async delete(id: string): Promise<{ message: string }> {
		return this.client.delete<{ message: string }>(
			`/api/webhook/v1/${encodeURIComponent(id)}`,
		);
	}
}
