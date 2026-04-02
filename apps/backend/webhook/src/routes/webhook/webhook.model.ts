import { t } from "elysia";

export namespace WebhookModel {
	const urlPattern = /^https?:\/\/.+/;
	const maskedSecretExample = "***masked***";

	export const webhookIdParam = t.String({
		minLength: 1,
		description: "Webhook ID",
	});

	export const createWebhookBody = t.Object(
		{
			name: t.String({
				minLength: 1,
				maxLength: 255,
				description: "Webhook name",
			}),
			url: t.String({
				pattern: urlPattern.source,
				description: "Webhook URL",
			}),
			secret: t.Optional(
				t.String({
					minLength: 8,
					maxLength: 255,
					description: "Webhook secret for HMAC signature verification",
				}),
			),
			customHeaders: t.Optional(
				t.Record(t.String(), t.String(), {
					description: "Custom headers to include in webhook requests",
				}),
			),
			rateLimitEnabled: t.Optional(
				t.Boolean({
					default: true,
					description: "Enable rate limiting",
				}),
			),
			maxRequestsPerMinute: t.Optional(
				t.Number({
					minimum: 1,
					maximum: 1000,
					default: 60,
					description: "Maximum requests per minute",
				}),
			),
			maxRetries: t.Optional(
				t.Number({
					minimum: 0,
					maximum: 10,
					default: 3,
					description: "Maximum retry attempts",
				}),
			),
			retryBackoffMultiplier: t.Optional(
				t.Number({
					minimum: 1,
					maximum: 10,
					default: 2,
					description: "Retry backoff multiplier",
				}),
			),
			filteringOptions: t.Optional(
				t.Record(t.String(), t.Any(), {
					description: "Event filtering options",
				}),
			),
		},
		{
			examples: [
				{
					name: "Payments Webhook",
					url: "https://example.com/webhooks/reloop",
					customHeaders: {
						"x-source": "reloop",
					},
					rateLimitEnabled: true,
					maxRequestsPerMinute: 60,
					maxRetries: 3,
					retryBackoffMultiplier: 2,
				},
			],
		},
	);

	export type CreateWebhookBody = typeof createWebhookBody.static;

	export const updateWebhookBody = t.Object(
		{
			name: t.Optional(
				t.String({
					minLength: 1,
					maxLength: 255,
					description: "Webhook name",
				}),
			),
			url: t.Optional(
				t.String({
					pattern: urlPattern.source,
					description: "Webhook URL",
				}),
			),
			secret: t.Optional(
				t.String({
					minLength: 8,
					maxLength: 255,
					description: "Webhook secret for HMAC signature verification",
				}),
			),
			status: t.Optional(
				t.Union(
					[t.Literal("active"), t.Literal("paused"), t.Literal("disabled")],
					{
						description: "Webhook status",
					},
				),
			),
			customHeaders: t.Optional(
				t.Record(t.String(), t.String(), {
					description: "Custom headers to include in webhook requests",
				}),
			),
			rateLimitEnabled: t.Optional(
				t.Boolean({
					description: "Enable rate limiting",
				}),
			),
			maxRequestsPerMinute: t.Optional(
				t.Number({
					minimum: 1,
					maximum: 1000,
					description: "Maximum requests per minute",
				}),
			),
			maxRetries: t.Optional(
				t.Number({
					minimum: 0,
					maximum: 10,
					description: "Maximum retry attempts",
				}),
			),
			retryBackoffMultiplier: t.Optional(
				t.Number({
					minimum: 1,
					maximum: 10,
					description: "Retry backoff multiplier",
				}),
			),
			filteringOptions: t.Optional(
				t.Record(t.String(), t.Any(), {
					description: "Event filtering options",
				}),
			),
		},
		{
			examples: [
				{
					name: "Payments Webhook",
					status: "paused",
					maxRetries: 5,
				},
			],
		},
	);

	export type UpdateWebhookBody = typeof updateWebhookBody.static;

	export const webhookResponse = t.Object(
		{
			id: t.String({ description: "Unique webhook identifier" }),
			name: t.String({ description: "Webhook name" }),
			url: t.String({ description: "Webhook URL" }),
			secret: t.String({
				description: "Masked webhook secret",
			}),
			organizationId: t.String({ description: "Organization ID" }),
			userId: t.String({ description: "User ID" }),
			status: t.Union(
				[
					t.Literal("active"),
					t.Literal("paused"),
					t.Literal("disabled"),
					t.Literal("failed"),
				],
				{ description: "Webhook status" },
			),
			customHeaders: t.Union([t.Record(t.String(), t.String()), t.Null()], {
				description: "Custom headers",
			}),
			rateLimitEnabled: t.Boolean({ description: "Rate limiting enabled" }),
			maxRequestsPerMinute: t.Number({
				description: "Max requests per minute",
			}),
			maxRetries: t.Number({ description: "Maximum retry attempts" }),
			retryBackoffMultiplier: t.Number({
				description: "Retry backoff multiplier",
			}),
			filteringOptions: t.Union([t.Record(t.String(), t.Any()), t.Null()], {
				description: "Event filtering options",
			}),
			lastTriggeredAt: t.Union([t.String(), t.Null()], {
				description: "Last triggered timestamp",
			}),
			successCount: t.Number({ description: "Successful delivery count" }),
			failureCount: t.Number({ description: "Failed delivery count" }),
			consecutiveFailures: t.Number({
				description: "Consecutive failure count",
			}),
			createdAt: t.String({ description: "Creation timestamp" }),
			updatedAt: t.String({ description: "Last update timestamp" }),
		},
		{
			examples: [
				{
					id: "wh_123456789",
					name: "Payments Webhook",
					url: "https://example.com/webhooks/reloop",
					secret: maskedSecretExample,
					organizationId: "org_123",
					userId: "user_123",
					status: "active",
					customHeaders: {
						"x-source": "reloop",
					},
					rateLimitEnabled: true,
					maxRequestsPerMinute: 60,
					maxRetries: 3,
					retryBackoffMultiplier: 2,
					filteringOptions: null,
					lastTriggeredAt: "2026-03-29T10:00:00Z",
					successCount: 10,
					failureCount: 1,
					consecutiveFailures: 0,
					createdAt: "2026-03-29T10:00:00Z",
					updatedAt: "2026-03-29T10:00:00Z",
				},
			],
		},
	);

	export type WebhookResponse = typeof webhookResponse.static;

	export const webhookListResponse = t.Object({
		webhooks: t.Array(webhookResponse),
		total: t.Number(),
		page: t.Number(),
		limit: t.Number(),
	});

	export type WebhookListResponse = typeof webhookListResponse.static;

	export const webhookQuery = t.Object({
		page: t.Optional(t.Number({ minimum: 1, default: 1 })),
		limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
		status: t.Optional(
			t.Union([
				t.Literal("active"),
				t.Literal("paused"),
				t.Literal("disabled"),
				t.Literal("failed"),
			]),
		),
		organizationId: t.Optional(t.String()),
		userId: t.Optional(t.String()),
	});

	export type WebhookQuery = typeof webhookQuery.static;

	// Error responses
	export const webhookNotFound = t.Object({
		message: t.Literal("Webhook not found"),
	});
	export type WebhookNotFound = typeof webhookNotFound.static;

	export const webhookAlreadyExists = t.Object({
		message: t.Literal("Webhook name already exists"),
	});
	export type WebhookAlreadyExists = typeof webhookAlreadyExists.static;

	export const invalidWebhookUrl = t.Object({
		message: t.Literal("Invalid webhook URL format"),
	});
	export type InvalidWebhookUrl = typeof invalidWebhookUrl.static;

	export const unauthorized = t.Object({
		message: t.Literal("Unauthorized access"),
	});
	export type Unauthorized = typeof unauthorized.static;

	export const validationError = t.Object({
		message: t.String(),
		errors: t.Array(t.String()),
	});
	export type ValidationError = typeof validationError.static;

	export const deleteWebhookResponse = t.Object(
		{
			id: t.String({ description: "Deleted webhook identifier" }),
			message: t.String({ description: "Success message" }),
		},
		{
			examples: [
				{
					id: "wh_123456789",
					message: "Webhook deleted successfully",
				},
			],
		},
	);
	export type DeleteWebhookResponse = typeof deleteWebhookResponse.static;
}
