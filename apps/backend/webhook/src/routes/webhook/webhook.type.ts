import type { WebhookEventName } from "@reloop/webhook-events";
import type { WebhookModel } from "./webhook.model";

export namespace WebhookTypes {
	export type WebhookResponse = typeof WebhookModel.webhookResponse.static;
	export type WebhookListResponse =
		typeof WebhookModel.webhookListResponse.static;
	export type CreateWebhookBody = typeof WebhookModel.createWebhookBody.static;
	export type UpdateWebhookBody = typeof WebhookModel.updateWebhookBody.static;
	export type WebhookQuery = typeof WebhookModel.webhookQuery.static;
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
		description: string;
		url: string;
		events: WebhookEventName[];
	}

	export interface UpdateWebhookRequest {
		description?: string;
		name?: string;
		url?: string;
		events?: WebhookEventName[];
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
	export interface TriggerWebhookRequest {
		event: string;
		payload: Record<string, unknown>;
		organizationId?: string;
		userId?: string;
	}

	export type WebhookDeliveryResponse =
		typeof WebhookModel.webhookDeliveryResponse.static;
	export type WebhookDeliveryListResponse =
		typeof WebhookModel.webhookDeliveryListResponse.static;
	export type WebhookDeliveryQuery =
		typeof WebhookModel.webhookDeliveryQuery.static;
	export type SignTestEventBody = typeof WebhookModel.signTestEventBody.static;
	export type SignTestEventResponse =
		typeof WebhookModel.signTestEventResponse.static;
}
