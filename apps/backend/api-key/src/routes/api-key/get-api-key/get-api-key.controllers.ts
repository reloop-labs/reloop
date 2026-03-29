import type { ApiKeyTypes } from "@reloop/api-key/types/api-key.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { and, eq } from "drizzle-orm";
import { status } from "elysia";

export async function getApiKeyController({
	apiKeyId,
	organizationId,
	userId,
	logger,
}: {
	apiKeyId: string;
	organizationId: string;
	userId: string;
	logger: Logger;
}): Promise<ApiKeyTypes.ApiKeyResponse> {
	logger.info({ apiKeyId, organizationId }, "Getting API key");

	try {
		const result = await db.query.apikey.findFirst({
			where: and(
				eq(schema.apikey.id, apiKeyId),
				eq(schema.apikey.organizationId, organizationId),
			),
			with: { user: true },
		});

		if (!result) {
			logger.warn({ apiKeyId }, "API key not found");
			throw status(404, { message: "API key not found" });
		}

		const { user, ...apiKeyData } = result;
		logger.info({ apiKeyId }, "API key retrieved successfully");
		return {
			id: apiKeyData.id,
			name: apiKeyData.name,
			start: apiKeyData.start,
			prefix: apiKeyData.prefix,
			organizationId: apiKeyData.organizationId,
			userId: apiKeyData.userId,
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
		};
	} catch (error) {
		logger.error(
			{
				apiKeyId,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error getting API key",
		);
		throw error;
	}
}
