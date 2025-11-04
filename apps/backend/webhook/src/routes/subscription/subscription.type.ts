import type { SubscriptionModel } from "./subscription.model";

export namespace SubscriptionTypes {
	export type SubscriptionResponse =
		typeof SubscriptionModel.subscriptionResponse.static;
	export type SubscriptionListResponse =
		typeof SubscriptionModel.subscriptionListResponse.static;
	export type SubscribeBody = typeof SubscriptionModel.subscribeBody.static;
	export type SubscriptionQuery =
		typeof SubscriptionModel.subscriptionQuery.static;
	export type SubscriptionNotFound =
		typeof SubscriptionModel.subscriptionNotFound.static;
	export type WebhookNotFound = typeof SubscriptionModel.webhookNotFound.static;
	export type EventNotFound = typeof SubscriptionModel.eventNotFound.static;
	export type SubscriptionAlreadyExists =
		typeof SubscriptionModel.subscriptionAlreadyExists.static;
	export type Unauthorized = typeof SubscriptionModel.unauthorized.static;

	// Backend types with Date objects
	export interface SubscriptionData {
		id: string;
		webhookId: string;
		eventId: string;
		isEnabled: boolean;
		createdAt: Date;
		updatedAt: Date;
	}

	export interface SubscribeRequest {
		eventIds: string[];
	}

	export interface SubscriptionListQuery {
		page?: number;
		limit?: number;
		webhookId?: string;
		eventId?: string;
		isEnabled?: boolean;
	}
}
