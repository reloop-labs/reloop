import { t } from "elysia";

export namespace ApiKeyModel {
	export const apiKeyIdParam = t.String({
		description: "API Key identifier",
	});

	export const createApiKeyBody = t.Object(
		{
			name: t.String({
				minLength: 1,
				maxLength: 255,
				description: "Name for the API key",
			}),
		},
		{
			examples: [
				{
					name: "Organization wide key",
				},
			],
		},
	);

	export type CreateApiKeyBody = typeof createApiKeyBody.static;

	export const updateApiKeyBody = t.Object(
		{
			name: t.String({
				minLength: 1,
				maxLength: 255,
				description: "Name for the API key",
			}),
		},
		{
			examples: [
				{
					name: "Updated API Key Name",
				},
			],
		},
	);

	export type UpdateApiKeyBody = typeof updateApiKeyBody.static;

	export const apiKeyResponse = t.Object(
		{
			id: t.String({ description: "Unique API key identifier" }),
			name: t.Union([t.String(), t.Null()], {
				description: "Name for the API key",
			}),
			start: t.Union([t.String(), t.Null()], {
				description: "Start of the API key (for display)",
			}),
			prefix: t.Union([t.String(), t.Null()], {
				description: "API key prefix",
			}),
			refillInterval: t.Union([t.Number(), t.Null()], {
				description: "Refill interval in milliseconds",
			}),
			refillAmount: t.Union([t.Number(), t.Null()], {
				description: "Amount to refill per interval",
			}),
			lastRefillAt: t.Union([t.String(), t.Null()], {
				description: "Last refill timestamp",
			}),
			enabled: t.Boolean({ description: "Whether the API key is enabled" }),
			rateLimitEnabled: t.Boolean({
				description: "Whether rate limiting is enabled",
			}),
			rateLimitTimeWindow: t.Number({
				description: "Rate limit time window in milliseconds",
			}),
			rateLimitMax: t.Number({
				description: "Maximum requests per time window",
			}),
			requestCount: t.Number({
				description: "Total request count",
			}),
			remaining: t.Union([t.Number(), t.Null()], {
				description: "Remaining requests",
			}),
			lastRequest: t.Union([t.String(), t.Null()], {
				description: "Last request timestamp",
			}),
			expiresAt: t.Union([t.String(), t.Null()], {
				description: "Expiration date",
			}),
			createdAt: t.String({ description: "Creation timestamp" }),
			updatedAt: t.String({ description: "Last update timestamp" }),
			permissions: t.Union([t.String(), t.Null()], {
				description: "Comma-separated permissions",
			}),
			metadata: t.Union([t.String(), t.Null()], {
				description: "JSON metadata string",
			}),
			createdBy: t.Optional(
				t.Object({
					id: t.String({ description: "User ID" }),
					name: t.Union([t.String(), t.Null()], { description: "User name" }),
					image: t.Union([t.String(), t.Null()], {
						description: "User avatar",
					}),
					email: t.String({ description: "User email" }),
				}),
			),
			object: t.Literal("api_key"),
			event: t.String({ description: "Event ID for the operation" }),
		},
		{
			examples: [
				{
					id: "key_123456789",
					name: "Production API Key",
					start: "rl_live",
					prefix: "rl",
					enabled: true,
					requestCount: 150,
					createdAt: "2026-03-29T10:00:00Z",
					updatedAt: "2026-03-29T10:00:00Z",
					permissions: "read,write",
					createdBy: {
						id: "user_123",
						name: "John Doe",
						email: "john@example.com",
					},
				},
			],
		},
	);

	export type ApiKeyResponse = typeof apiKeyResponse.static;

	export const apiKeyWithKeyResponse = t.Object(
		{
			id: t.String({ description: "Unique API key identifier" }),
			name: t.Union([t.String(), t.Null()], {
				description: "Name for the API key",
			}),
			key: t.String({ description: "Full API key (only shown once)" }),
			enabled: t.Boolean({ description: "Whether the API key is enabled" }),
			createdAt: t.String({ description: "Creation timestamp" }),
			updatedAt: t.String({ description: "Last update timestamp" }),
			permissions: t.Union([t.String(), t.Null()], {
				description: "Comma-separated permissions",
			}),
			object: t.Literal("api_key"),
			event: t.String({ description: "Event ID for the operation" }),
		},
		{
			examples: [
				{
					id: "key_123456789",
					name: "Production API Key",
					key: "rl_live_abc123def456ghi789",
					enabled: true,
					createdAt: "2026-03-29T10:00:00Z",
					updatedAt: "2026-03-29T10:00:00Z",
					permissions: "read,write",
				},
			],
		},
	);

	export type ApiKeyWithKeyResponse = typeof apiKeyWithKeyResponse.static;

	export const apiKeyListResponse = t.Object({
		object: t.Literal("api_key"),
		apiKeys: t.Array(apiKeyResponse),
		total: t.Number(),
		page: t.Number(),
		limit: t.Number(),
		event: t.String({ description: "Event ID for the list operation" }),
	});

	export type ApiKeyListResponse = typeof apiKeyListResponse.static;

	export const apiKeyQuery = t.Object({
		page: t.Optional(t.Number({ minimum: 1, default: 1 })),
		limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
		enabled: t.Optional(t.Boolean()),
		userId: t.Optional(t.String()),
		q: t.Optional(t.String()),
	});

	export type ApiKeyQuery = typeof apiKeyQuery.static;

	export const apiKeyNotFound = t.Object({
		message: t.Literal("API key not found"),
	});
	export type ApiKeyNotFound = typeof apiKeyNotFound.static;

	export const apiKeyAlreadyExists = t.Object({
		message: t.Literal("API key already exists"),
	});
	export type ApiKeyAlreadyExists = typeof apiKeyAlreadyExists.static;

	export const invalidApiKey = t.Object({
		message: t.Literal("Invalid API key"),
	});
	export type InvalidApiKey = typeof invalidApiKey.static;

	export const unauthorized = t.Object({
		message: t.Literal("Unauthorized access"),
	});
	export type Unauthorized = typeof unauthorized.static;

	export const forbidden = t.Object({
		message: t.Literal("Access forbidden"),
	});
	export type Forbidden = typeof forbidden.static;

	export const usageStatsResponse = t.Object({
		id: t.String({ description: "API key identifier" }),
		requestCount: t.Number({ description: "Total request count" }),
		remaining: t.Union([t.Number(), t.Null()], {
			description: "Remaining requests in current window",
		}),
		lastRequest: t.Union([t.String(), t.Null()], {
			description: "Last request timestamp",
		}),
		rateLimitEnabled: t.Boolean({
			description: "Whether rate limiting is enabled",
		}),
		rateLimitMax: t.Number({
			description: "Maximum requests per time window",
		}),
		rateLimitTimeWindow: t.Number({
			description: "Rate limit time window in milliseconds",
		}),
		lastRefillAt: t.Union([t.String(), t.Null()], {
			description: "Last refill timestamp",
		}),
	});
	export type UsageStatsResponse = typeof usageStatsResponse.static;

	export const successResponse = t.Object({
		success: t.Boolean({ description: "Operation success status" }),
		message: t.String({ description: "Success message" }),
	});
	export type SuccessResponse = typeof successResponse.static;

	export const deleteApiKeyResponse = t.Object(
		{
			id: t.String({ description: "Deleted API key identifier" }),
			message: t.String({ description: "Success message" }),
			object: t.Literal("api_key"),
			event: t.String({ description: "Event ID for the operation" }),
		},
		{
			examples: [
				{
					id: "key_123456789",
					message: "API key deleted successfully",
				},
			],
		},
	);
	export type DeleteApiKeyResponse = typeof deleteApiKeyResponse.static;
}
