import * as z from "zod";
import type { ApiKey, ApiKeyWithSecret } from "../../reloop/types";
import { resourceIdSchema } from "../contacts/schemas";

export const apiKeyIdSchema = resourceIdSchema.describe(
	"API key ID as returned by Reloop",
);

export const apiKeyNameSchema = z
	.string()
	.trim()
	.min(1)
	.max(255)
	.describe("Human-readable name for the key, for example Production server");

export const apiKeySchema = z.object({
	id: z.string(),
	name: z.string().nullable(),
	start: z
		.string()
		.nullable()
		.describe("First characters of the key, for recognizing it"),
	enabled: z.boolean(),
	permissions: z.string().nullable(),
	requestCount: z.number().int(),
	lastUsedAt: z.string().nullable(),
	expiresAt: z.string().nullable(),
	createdBy: z
		.object({ id: z.string(), name: z.string().nullable(), email: z.string() })
		.nullable(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export type ApiKeyOutput = z.output<typeof apiKeySchema>;

export function toApiKeyOutput(apiKey: ApiKey): ApiKeyOutput {
	return {
		id: apiKey.id,
		name: apiKey.name,
		start: apiKey.start,
		enabled: apiKey.enabled,
		permissions: apiKey.permissions,
		requestCount: apiKey.requestCount,
		lastUsedAt: apiKey.lastRequest,
		expiresAt: apiKey.expiresAt,
		createdBy:
			apiKey.createdBy === undefined
				? null
				: {
						id: apiKey.createdBy.id,
						name: apiKey.createdBy.name,
						email: apiKey.createdBy.email,
					},
		createdAt: apiKey.createdAt,
		updatedAt: apiKey.updatedAt,
	};
}

export const apiKeySecretSchema = z.object({
	id: z.string(),
	name: z.string().nullable(),
	key: z
		.string()
		.describe(
			"Full secret key. Reloop shows it only once; it cannot be retrieved again",
		),
	enabled: z.boolean(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export function toApiKeySecretOutput(
	apiKey: ApiKeyWithSecret,
): z.output<typeof apiKeySecretSchema> {
	return {
		id: apiKey.id,
		name: apiKey.name,
		key: apiKey.key,
		enabled: apiKey.enabled,
		createdAt: apiKey.createdAt,
		updatedAt: apiKey.updatedAt,
	};
}
