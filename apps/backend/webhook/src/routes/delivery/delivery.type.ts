import type { DeliveryModel } from "./delivery.model";

export namespace DeliveryTypes {
	export type DeliveryResponse = typeof DeliveryModel.deliveryResponse.static;
	export type DeliveryListResponse =
		typeof DeliveryModel.deliveryListResponse.static;
	export type DeliveryQuery = typeof DeliveryModel.deliveryQuery.static;
	export type RetryDeliveryBody = typeof DeliveryModel.retryDeliveryBody.static;
	export type DeliveryNotFound = typeof DeliveryModel.deliveryNotFound.static;
	export type Unauthorized = typeof DeliveryModel.unauthorized.static;
	export type RetryNotAllowed = typeof DeliveryModel.retryNotAllowed.static;

	// Backend types with Date objects
	export interface DeliveryData {
		id: string;
		webhookId: string;
		eventId: string;
		eventData: Record<string, unknown>;
		status: "pending" | "success" | "failed" | "retrying";
		requestUrl: string;
		requestHeaders: Record<string, string> | null;
		requestBody: Record<string, unknown> | null;
		responseStatus: number | null;
		responseBody: string | null;
		responseHeaders: Record<string, string> | null;
		attemptNumber: number;
		maxAttempts: number;
		nextRetryAt: Date | null;
		lastAttemptAt: Date | null;
		errorMessage: string | null;
		errorDetails: Record<string, unknown> | null;
		completedAt: Date | null;
		createdAt: Date;
	}

	export interface DeliveryListQuery {
		page?: number;
		limit?: number;
		webhookId?: string;
		eventId?: string;
		status?: "pending" | "success" | "failed" | "retrying";
		fromDate?: string;
		toDate?: string;
	}

	export interface RetryDeliveryRequest {
		force?: boolean;
	}
}
