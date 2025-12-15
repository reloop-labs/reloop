import { t } from "elysia";

export namespace ApiKeyModel {
	export const apiKeyIdParam = t.String({
		description: "API Key identifier",
	});

	export const createApiKeyBody = t.Object({
		name: t.Optional(
			t.String({
				minLength: 1,
				maxLength: 255,
				description: "Name for the API key",
			}),
		),
		expiresAt: t.Optional(
			t.Union([t.String(), t.Null()], {
				description: "Expiration date (ISO 8601)",
			}),
		),
		refillInterval: t.Optional(
			t.Number({
				minimum: 0,
				description: "Refill interval in milliseconds",
			}),
		),
		refillAmount: t.Optional(
			t.Number({
				minimum: 0,
				description: "Amount to refill per interval",
			}),
		),
		enabled: t.Optional(
			t.Boolean({
				description: "Whether the API key is enabled",
			}),
		),
		rateLimitEnabled: t.Optional(
			t.Boolean({
				description: "Whether rate limiting is enabled",
			}),
		),
		rateLimitTimeWindow: t.Optional(
			t.Number({
				minimum: 0,
				description: "Rate limit time window in milliseconds",
			}),
		),
		rateLimitMax: t.Optional(
			t.Number({
				minimum: 0,
				description: "Maximum requests per time window",
			}),
		),
		permissions: t.Optional(
			t.Union([t.String(), t.Null()], {
				description: "Comma-separated permissions",
			}),
		),
		metadata: t.Optional(
			t.Union([t.String(), t.Null()], {
				description: "JSON metadata string",
			}),
		),
	});

	export type CreateApiKeyBody = typeof createApiKeyBody.static;

	export const updateApiKeyBody = t.Object({
		name: t.Optional(
			t.String({
				minLength: 1,
				maxLength: 255,
				description: "Name for the API key",
			}),
		),
		expiresAt: t.Optional(
			t.Union([t.String(), t.Null()], {
				description: "Expiration date (ISO 8601)",
			}),
		),
		refillInterval: t.Optional(
			t.Number({
				minimum: 0,
				description: "Refill interval in milliseconds",
			}),
		),
		refillAmount: t.Optional(
			t.Number({
				minimum: 0,
				description: "Amount to refill per interval",
			}),
		),
		enabled: t.Optional(
			t.Boolean({
				description: "Whether the API key is enabled",
			}),
		),
		rateLimitEnabled: t.Optional(
			t.Boolean({
				description: "Whether rate limiting is enabled",
			}),
		),
		rateLimitTimeWindow: t.Optional(
			t.Number({
				minimum: 0,
				description: "Rate limit time window in milliseconds",
			}),
		),
		rateLimitMax: t.Optional(
			t.Number({
				minimum: 0,
				description: "Maximum requests per time window",
			}),
		),
		permissions: t.Optional(
			t.Union([t.String(), t.Null()], {
				description: "Comma-separated permissions",
			}),
		),
		metadata: t.Optional(
			t.Union([t.String(), t.Null()], {
				description: "JSON metadata string",
			}),
		),
	});

	export type UpdateApiKeyBody = typeof updateApiKeyBody.static;

	export const apiKeyResponse = t.Object({
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
		organizationId: t.String({ description: "Organization identifier" }),
		userId: t.String({ description: "User identifier" }),
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
				image: t.Union([t.String(), t.Null()], { description: "User avatar" }),
				email: t.String({ description: "User email" }),
			}),
		),
	});

	export type ApiKeyResponse = typeof apiKeyResponse.static;

	export const apiKeyWithKeyResponse = t.Object({
		id: t.String({ description: "Unique API key identifier" }),
		name: t.Union([t.String(), t.Null()], {
			description: "Name for the API key",
		}),
		key: t.String({ description: "Full API key (only shown once)" }),
		start: t.Union([t.String(), t.Null()], {
			description: "Start of the API key (for display)",
		}),
		prefix: t.Union([t.String(), t.Null()], {
			description: "API key prefix",
		}),
		organizationId: t.String({ description: "Organization identifier" }),
		userId: t.String({ description: "User identifier" }),
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
	});

	export type ApiKeyWithKeyResponse = typeof apiKeyWithKeyResponse.static;

	export const apiKeyListResponse = t.Object({
		apiKeys: t.Array(apiKeyResponse),
		total: t.Number(),
		page: t.Number(),
		limit: t.Number(),
	});

	export type ApiKeyListResponse = typeof apiKeyListResponse.static;

	export const apiKeyQuery = t.Object({
		page: t.Optional(t.Number({ minimum: 1, default: 1 })),
		limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
		enabled: t.Optional(t.Boolean()),
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
}
