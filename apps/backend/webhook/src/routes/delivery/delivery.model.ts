import { t } from "elysia";

export namespace DeliveryModel {
	export const deliveryIdParam = t.String({
		minLength: 1,
		description: "Delivery ID",
	});

	export const deliveryResponse = t.Object({
		id: t.String({ description: "Unique delivery identifier" }),
		webhookId: t.String({ description: "Webhook ID" }),
		eventId: t.String({ description: "Event ID" }),
		eventData: t.Record(t.String(), t.Any(), {
			description: "Event data payload",
		}),
		status: t.Union(
			[
				t.Literal("pending"),
				t.Literal("success"),
				t.Literal("failed"),
				t.Literal("retrying"),
			],
			{ description: "Delivery status" },
		),
		requestUrl: t.String({ description: "Request URL" }),
		requestHeaders: t.Union([t.Record(t.String(), t.String()), t.Null()], {
			description: "Request headers",
		}),
		requestBody: t.Union([t.Record(t.String(), t.Any()), t.Null()], {
			description: "Request body",
		}),
		responseStatus: t.Union([t.Number(), t.Null()], {
			description: "Response status code",
		}),
		responseBody: t.Union([t.String(), t.Null()], {
			description: "Response body",
		}),
		responseHeaders: t.Union([t.Record(t.String(), t.String()), t.Null()], {
			description: "Response headers",
		}),
		attemptNumber: t.Number({ description: "Current attempt number" }),
		maxAttempts: t.Number({ description: "Maximum attempts" }),
		nextRetryAt: t.Union([t.String(), t.Null()], {
			description: "Next retry timestamp",
		}),
		lastAttemptAt: t.Union([t.String(), t.Null()], {
			description: "Last attempt timestamp",
		}),
		errorMessage: t.Union([t.String(), t.Null()], {
			description: "Error message",
		}),
		errorDetails: t.Union([t.Record(t.String(), t.Any()), t.Null()], {
			description: "Error details",
		}),
		completedAt: t.Union([t.String(), t.Null()], {
			description: "Completion timestamp",
		}),
		createdAt: t.String({ description: "Creation timestamp" }),
	});

	export type DeliveryResponse = typeof deliveryResponse.static;

	export const deliveryListResponse = t.Object({
		deliveries: t.Array(deliveryResponse),
		total: t.Number(),
		page: t.Number(),
		limit: t.Number(),
	});

	export type DeliveryListResponse = typeof deliveryListResponse.static;

	export const deliveryQuery = t.Object({
		page: t.Optional(t.Number({ minimum: 1, default: 1 })),
		limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
		webhookId: t.Optional(t.String()),
		eventId: t.Optional(t.String()),
		status: t.Optional(
			t.Union([
				t.Literal("pending"),
				t.Literal("success"),
				t.Literal("failed"),
				t.Literal("retrying"),
			]),
		),
		fromDate: t.Optional(t.String({ format: "date-time" })),
		toDate: t.Optional(t.String({ format: "date-time" })),
	});

	export type DeliveryQuery = typeof deliveryQuery.static;

	export const retryDeliveryBody = t.Object({
		force: t.Optional(
			t.Boolean({
				default: false,
				description: "Force retry even if max attempts reached",
			}),
		),
	});

	export type RetryDeliveryBody = typeof retryDeliveryBody.static;

	// Error responses
	export const deliveryNotFound = t.Object({
		message: t.Literal("Delivery not found"),
	});
	export type DeliveryNotFound = typeof deliveryNotFound.static;

	export const unauthorized = t.Object({
		message: t.Literal("Unauthorized access"),
	});
	export type Unauthorized = typeof unauthorized.static;

	export const retryNotAllowed = t.Object({
		message: t.Literal("Retry not allowed - max attempts reached"),
	});
	export type RetryNotAllowed = typeof retryNotAllowed.static;
}
