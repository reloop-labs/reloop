import {
	ACTIVE_WEBHOOK_EVENTS,
	WEBHOOK_EVENTS,
	type WebhookEventName,
} from "@reloop/webhook-events";
import { t } from "elysia";

export namespace WebhookModel {
	// Allow http for local/dev endpoints; delivery still prefers https in prod.
	const urlPattern = /^https?:\/\/.+/;
	const maskedSecretExample = "***masked***";

	/** Events allowed on create / trigger (subscribable). */
	const activeEventIds = ACTIVE_WEBHOOK_EVENTS.map((event) => event.id);
	const activeEventRegex = new RegExp(
		`^(${activeEventIds.join("|").replace(/\./g, "\\.")})$`,
	);

	/**
	 * Full catalog + loose string for response validation.
	 * Existing webhooks may still hold inactive/legacy event IDs
	 * (e.g. domain.list, contact.create) — list/get must not 500 on those.
	 */
	const knownEventIds = WEBHOOK_EVENTS.map((event) => event.id);
	const knownEventRegex = new RegExp(
		`^(${knownEventIds.join("|").replace(/\./g, "\\.")})$`,
	);

	export const webhookIdParam = t.String({
		minLength: 1,
		description: "Webhook ID",
	});

	export const createWebhookBody = t.Object(
		{
			description: t.String({
				minLength: 1,
				maxLength: 255,
				description: "Webhook description",
				error: "Please provide a valid webhook description",
			}),
			url: t.String({
				pattern: urlPattern.source,
				description: "Webhook URL",
				error: "Please provide a valid webhook URL",
			}),
			events: t.Array(
				t.String({
					pattern: activeEventRegex.source,
					error: "Invalid or inactive event ID provided",
				}),
				{
					minItems: 1,
					description: "Array of active event IDs to subscribe to",
					error: "Please provide at least one valid event ID to subscribe to",
				},
			),
		},
		{
			examples: [
				{
					description: "My Webhook",
					url: "https://example.com/webhooks/reloop",
					events: ["email.sent", "email.delivered", "domain.create"],
				},
			],
		},
	);

	export type CreateWebhookBody = Omit<
		typeof createWebhookBody.static,
		"events"
	> & {
		events: WebhookEventName[];
	};

	export const updateWebhookBody = t.Object(
		{
			description: t.Optional(
				t.String({
					minLength: 1,
					maxLength: 255,
					description: "Webhook description",
				}),
			),
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
			events: t.Optional(
				t.Array(
					t.String({
						pattern: activeEventRegex.source,
						error: "Invalid or inactive event ID provided",
					}),
					{
						minItems: 1,
						description: "Array of active event IDs to subscribe to",
						error: "Please provide at least one valid event ID to subscribe to",
					},
				),
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
					events: ["email.sent", "email.delivered"],
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
			/** Daily successful deliveries for the last 7 days (oldest → newest). List only. */
			healthSeries: t.Optional(
				t.Array(t.Number(), {
					description:
						"Daily successful delivery counts for the last 7 days (oldest first)",
				}),
			),
			/** Successful deliveries in the last 7 days. List only. */
			healthSuccessCount7d: t.Optional(
				t.Number({ description: "Successful deliveries in the last 7 days" }),
			),
			/** Failed deliveries in the last 7 days. List only. */
			healthFailureCount7d: t.Optional(
				t.Number({ description: "Failed deliveries in the last 7 days" }),
			),
			// Do NOT restrict to active-only — existing rows may hold inactive/legacy IDs.
			events: t.Array(t.String({ minLength: 1 }), {
				description:
					"Subscribed event IDs (includes inactive/legacy if already stored)",
			}),
			createdBy: t.Optional(
				t.Object(
					{
						id: t.String(),
						name: t.Union([t.String(), t.Null()]),
						email: t.String(),
						image: t.Union([t.String(), t.Null()]),
					},
					{ description: "User who created this webhook" },
				),
			),
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
					status: "active",
					customHeaders: {
						"x-source": "reloop",
					},
					rateLimitEnabled: true,
					maxRequestsPerMinute: 60,
					maxRetries: 7,
					retryBackoffMultiplier: 2,
					filteringOptions: null,
					lastTriggeredAt: "2026-03-29T10:00:00Z",
					successCount: 10,
					failureCount: 1,
					consecutiveFailures: 0,
					healthSeries: [2, 1, 4, 3, 5, 2, 6],
					healthSuccessCount7d: 23,
					healthFailureCount7d: 1,
					events: ["email.sent", "domain.create"],
					createdAt: "2026-03-29T10:00:00Z",
					updatedAt: "2026-03-29T10:00:00Z",
				},
			],
		},
	);

	export type WebhookResponse = Omit<
		typeof webhookResponse.static,
		"events"
	> & {
		events: WebhookEventName[];
	};

	export const webhookListResponse = t.Object({
		webhooks: t.Array(webhookResponse),
		total: t.Number(),
		page: t.Number(),
		limit: t.Number(),
	});

	export type WebhookListResponse = typeof webhookListResponse.static;

	export const webhookQuery = t.Object({
		page: t.Optional(t.Numeric({ minimum: 1, default: 1 })),
		limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100, default: 10 })),
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

	// Shared error response shape — matches EvlogError.toJSON()
	export const evlogError = t.Object({
		name: t.String(),
		message: t.String(),
		status: t.Number(),
		data: t.Optional(
			t.Object({
				why: t.Optional(t.String()),
				fix: t.Optional(t.String()),
				link: t.Optional(t.String()),
			}),
		),
	});
	export type EvlogError = typeof evlogError.static;

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
	export const triggerWebhookBody = t.Object(
		{
			// Manual trigger: allow any known catalog event so users can test
			// existing inactive/legacy subscriptions too.
			event: t.String({
				pattern: knownEventRegex.source,
				error: "Invalid event ID provided",
			}),
			payload: t.Record(t.String(), t.Any(), {
				description: "Event payload (becomes envelope.data)",
			}),
			organizationId: t.Optional(
				t.String({
					description: "Organization ID to trigger webhooks for",
				}),
			),
			userId: t.Optional(
				t.String({
					description: "User ID to trigger webhooks for",
				}),
			),
		},
		{
			examples: [
				{
					event: "domain.create",
					payload: {
						domainId: "dom_123456789",
						domain: "example.com",
					},
					organizationId: "org_123456789",
				},
			],
		},
	);

	export type TriggerWebhookBody = typeof triggerWebhookBody.static;

	export const triggerWebhookResponse = t.Object({
		success: t.Boolean(),
		message: t.String(),
		jobId: t.Optional(t.String()),
	});

	export type TriggerWebhookResponse = typeof triggerWebhookResponse.static;
	export const webhookDeliveryResponse = t.Object({
		id: t.String({ description: "Unique delivery identifier" }),
		webhookId: t.String({ description: "Webhook identifier" }),
		webhookEventId: t.Union([t.String(), t.Null()], {
			description: "Event identifier",
		}),
		eventType: t.String({ description: "Event type" }),
		eventData: t.Record(t.String(), t.Any(), { description: "Event payload" }),
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
		requestHeaders: t.Union([t.Record(t.String(), t.String()), t.Null()]),
		requestBody: t.Union([t.Record(t.String(), t.Any()), t.Null()]),
		responseStatus: t.Union([t.Number(), t.Null()]),
		responseBody: t.Union([t.String(), t.Null()]),
		responseHeaders: t.Union([t.Record(t.String(), t.String()), t.Null()]),
		attemptNumber: t.Number(),
		maxAttempts: t.Number(),
		nextRetryAt: t.Union([t.String(), t.Null()]),
		lastAttemptAt: t.Union([t.String(), t.Null()]),
		errorMessage: t.Union([t.String(), t.Null()]),
		errorDetails: t.Union([t.Record(t.String(), t.Any()), t.Null()]),
		completedAt: t.Union([t.String(), t.Null()]),
		durationMs: t.Union([t.Number(), t.Null()]),
		createdAt: t.String(),
	});

	export type WebhookDeliveryResponse = typeof webhookDeliveryResponse.static;

	export const webhookDeliveryListResponse = t.Object({
		deliveries: t.Array(webhookDeliveryResponse),
		total: t.Number(),
		page: t.Number(),
		limit: t.Number(),
	});

	export type WebhookDeliveryListResponse =
		typeof webhookDeliveryListResponse.static;

	export const webhookDeliveryQuery = t.Object({
		page: t.Optional(t.Numeric({ minimum: 1, default: 1 })),
		limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100, default: 10 })),
		status: t.Optional(
			t.Union([
				t.Literal("pending"),
				t.Literal("success"),
				t.Literal("failed"),
				t.Literal("retrying"),
				t.Literal(""),
			]),
		),
	});

	export type WebhookDeliveryQuery = typeof webhookDeliveryQuery.static;
}
