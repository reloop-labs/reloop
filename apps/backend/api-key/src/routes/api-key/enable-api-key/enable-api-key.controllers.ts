import type { ApiKeyTypes } from "@reloop/api-key/types/api-key.type";
import { createLog } from "@reloop/api-key/utils/logger";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { API_KEY_UPDATE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq } from "drizzle-orm";
import { status } from "elysia";

export async function enableApiKeyController({
	id,
	organizationId,
	logger,
	cookie,
	requestDetails,
}: {
	id: string;
	organizationId: string;
	logger: Logger;
	cookie?: string;
	requestDetails?: {
		endpoint?: string;
		method?: string;
		userAgent?: string;
		ipAddress?: string;
    statusCode?: number;
	};
}): Promise<ApiKeyTypes.ApiKeyResponse> {
	try {
		logger.info({ id, organizationId }, "Search for api key");
		const existingKey = await db.query.apikey.findFirst({
			where: and(
				eq(schema.apikey.id, id),
				eq(schema.apikey.organizationId, organizationId),
			),
			with: {
				user: true,
			},
		});

		if (!existingKey) {
			logger.warn({ id }, "API key not found");
			throw status(404, { message: "API key not found" });
		}

		let updatedKeyData: typeof schema.apikey.$inferSelect;

		if (existingKey.enabled) {
			logger.info({ id }, "API key is already enabled");
			updatedKeyData = existingKey;
		} else {
			const now = new Date();
			logger.info({ id, now }, "Updating API key");
			const [updatedKey] = await db
				.update(schema.apikey)
				.set({
					enabled: true,
					updatedAt: now,
				})
				.where(eq(schema.apikey.id, id))
				.returning();

			if (!updatedKey) {
				logger.error({ id }, "Failed to enable API key");
				throw status(500, { message: "Failed to enable API key" });
			}
			updatedKeyData = updatedKey;
		}

		logger.info({ id }, "API key enabled successfully");

		const result = {
			id: updatedKeyData.id,
			name: updatedKeyData.name,
			start: updatedKeyData.start,
			prefix: updatedKeyData.prefix,
			organizationId: updatedKeyData.organizationId,
			userId: updatedKeyData.userId,
			refillInterval: updatedKeyData.refillInterval,
			refillAmount: updatedKeyData.refillAmount,
			lastRefillAt: updatedKeyData.lastRefillAt?.toISOString() ?? null,
			enabled: updatedKeyData.enabled,
			rateLimitEnabled: updatedKeyData.rateLimitEnabled,
			rateLimitTimeWindow: updatedKeyData.rateLimitTimeWindow,
			rateLimitMax: updatedKeyData.rateLimitMax,
			requestCount: updatedKeyData.requestCount,
			remaining: updatedKeyData.remaining,
			lastRequest: updatedKeyData.lastRequest?.toISOString() ?? null,
			expiresAt: updatedKeyData.expiresAt?.toISOString() ?? null,
			createdAt: updatedKeyData.createdAt.toISOString(),
			updatedAt: updatedKeyData.updatedAt.toISOString(),
			permissions: updatedKeyData.permissions,
			metadata: updatedKeyData.metadata,
			createdBy: {
				id: existingKey.user.id,
				name: existingKey.user.name,
				image: existingKey.user.image,
				email: existingKey.user.email,
			},
			object: "api_key" as const,
			event: API_KEY_UPDATE_WEBHOOK_EVENT.id,
		};

		await createLog({
			event: API_KEY_UPDATE_WEBHOOK_EVENT.id,
			cookie,
			metadata: result as Record<string, unknown>,
			requestDetails: { ...(requestDetails || {}), statusCode: 200 },
		});

		return result;
	} catch (error) {
		logger.error({ id, error }, "Error enabling API key");
		throw error;
	}
}
