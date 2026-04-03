import type { WebhookEventName } from "@reloop/webhook-events";
import type { WebhookModel } from "./webhook.model";

export namespace WebhookTypes {
	export type WebhookResponse = typeof WebhookModel.webhookResponse.static;
	export type WebhookListResponse =
		typeof WebhookModel.webhookListResponse.static;
	export type CreateWebhookBody = typeof WebhookModel.createWebhookBody.static;
	export type UpdateWebhookBody = typeof WebhookModel.updateWebhookBody.static;
	export type WebhookQuery = typeof WebhookModel.webhookQuery.static;
	export type WebhookNotFound = typeof WebhookModel.webhookNotFound.static;
	export type WebhookAlreadyExists =
		typeof WebhookModel.webhookAlreadyExists.static;
	export type InvalidWebhookUrl = typeof WebhookModel.invalidWebhookUrl.static;
	export type Unauthorized = typeof WebhookModel.unauthorized.static;
	export type ValidationError = typeof WebhookModel.validationError.static;
	export type DeleteWebhookResponse =
		typeof WebhookModel.deleteWebhookResponse.static;

	// Backend types with Date objects
	export interface WebhookData {
		id: string;
		name: string;
		url: string;
		secret: string;
		organizationId: string;
		userId: string;
		status: "active" | "paused" | "disabled" | "failed";
		customHeaders: Record<string, string> | null;
		rateLimitEnabled: boolean;
		maxRequestsPerMinute: number;
		maxRetries: number;
		retryBackoffMultiplier: number;
		filteringOptions: Record<string, unknown> | null;
		lastTriggeredAt: Date | null;
		successCount: number;
		failureCount: number;
		consecutiveFailures: number;
		deletedAt: Date | null;
		createdAt: Date;
		updatedAt: Date;
	}

	export interface CreateWebhookRequest {
		url: string;
		events: WebhookEventName[];
	}

	export interface UpdateWebhookRequest {
		name?: string;
		url?: string;
		secret?: string;
		status?: "active" | "paused" | "disabled";
		customHeaders?: Record<string, string>;
		rateLimitEnabled?: boolean;
		maxRequestsPerMinute?: number;
		maxRetries?: number;
		retryBackoffMultiplier?: number;
		filteringOptions?: Record<string, unknown>;
	}

	export interface WebhookListQuery {
		page?: number;
		limit?: number;
		status?: "active" | "paused" | "disabled" | "failed";
		organizationId?: string;
		userId?: string;
	}
}
