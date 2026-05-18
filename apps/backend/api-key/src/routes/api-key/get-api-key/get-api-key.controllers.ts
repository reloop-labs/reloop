import { ApiKeyErrors } from "@reloop/api-key/error/api-key.error-response";
import type { ApiKeyTypes } from "@reloop/api-key/types/api-key.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { API_KEY_GET_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

export async function getApiKeyController({
	apiKeyId,
	organizationId,
}: {
	apiKeyId: string;
	organizationId: string;
}): Promise<ApiKeyTypes.ApiKeyResponse> {
	const log = useLogger();
	log.info("Getting API key");
	try {
		const result = await db.query.apikey.findFirst({
			where: and(
				eq(schema.apikey.id, apiKeyId),
				eq(schema.apikey.organizationId, organizationId),
			),
			with: { user: true },
		});

		if (!result) {
			log.warn("API key not found");
			throw ApiKeyErrors.notFound(apiKeyId);
		}

		const { user, ...apiKeyData } = result;
		log.info("API key retrieved successfully");
		return {
			id: apiKeyData.id,
			name: apiKeyData.name,
			start: apiKeyData.start,
			prefix: apiKeyData.prefix,
			refillInterval: apiKeyData.refillInterval,
			refillAmount: apiKeyData.refillAmount,
			lastRefillAt: apiKeyData.lastRefillAt?.toISOString() ?? null,
			enabled: apiKeyData.enabled,
			rateLimitEnabled: apiKeyData.rateLimitEnabled,
			rateLimitTimeWindow: apiKeyData.rateLimitTimeWindow,
			rateLimitMax: apiKeyData.rateLimitMax,
			requestCount: apiKeyData.requestCount,
			remaining: apiKeyData.remaining,
			lastRequest: apiKeyData.lastRequest?.toISOString() ?? null,
			expiresAt: apiKeyData.expiresAt?.toISOString() ?? null,
			createdAt: apiKeyData.createdAt.toISOString(),
			updatedAt: apiKeyData.updatedAt.toISOString(),
			permissions: apiKeyData.permissions,
			metadata: apiKeyData.metadata,
			createdBy: {
				id: user.id,
				name: user.name,
				image: user.image,
				email: user.email,
			},
			object: "api_key" as const,
			event: API_KEY_GET_WEBHOOK_EVENT.id,
		};
	} catch (error) {
		log.error("Error getting API key");
		throw error;
	}
}
