import type { ApiKeyTypes } from "@reloop/api-key/types/api-key.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { and, eq } from "drizzle-orm";
import { status } from "elysia";

export async function enableApiKeyController({
	id,
	organizationId,
	logger,
}: {
	id: string;
	organizationId: string;
	logger: Logger;
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
		if (existingKey.enabled) {
			logger.info({ id }, "API key is already enabled");
			return {
				id: existingKey.id,
				name: existingKey.name,
				start: existingKey.start,
				prefix: existingKey.prefix,
				organizationId: existingKey.organizationId,
				userId: existingKey.userId,
				refillInterval: existingKey.refillInterval,
				refillAmount: existingKey.refillAmount,
				lastRefillAt: existingKey.lastRefillAt?.toISOString() ?? null,
				enabled: existingKey.enabled,
				rateLimitEnabled: existingKey.rateLimitEnabled,
				rateLimitTimeWindow: existingKey.rateLimitTimeWindow,
				rateLimitMax: existingKey.rateLimitMax,
				requestCount: existingKey.requestCount,
				remaining: existingKey.remaining,
				lastRequest: existingKey.lastRequest?.toISOString() ?? null,
				expiresAt: existingKey.expiresAt?.toISOString() ?? null,
				createdAt: existingKey.createdAt.toISOString(),
				updatedAt: existingKey.updatedAt.toISOString(),
				permissions: existingKey.permissions,
				metadata: existingKey.metadata,
				createdBy: {
					id: existingKey.user.id,
					name: existingKey.user.name,
					image: existingKey.user.image,
					email: existingKey.user.email,
				},
			};
		}
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
		logger.info({ id }, "API key enabled successfully");
		return {
			id: updatedKey.id,
			name: updatedKey.name,
			start: updatedKey.start,
			prefix: updatedKey.prefix,
			organizationId: updatedKey.organizationId,
			userId: updatedKey.userId,
			refillInterval: updatedKey.refillInterval,
			refillAmount: updatedKey.refillAmount,
			lastRefillAt: updatedKey.lastRefillAt?.toISOString() ?? null,
			enabled: updatedKey.enabled,
			rateLimitEnabled: updatedKey.rateLimitEnabled,
			rateLimitTimeWindow: updatedKey.rateLimitTimeWindow,
			rateLimitMax: updatedKey.rateLimitMax,
			requestCount: updatedKey.requestCount,
			remaining: updatedKey.remaining,
			lastRequest: updatedKey.lastRequest?.toISOString() ?? null,
			expiresAt: updatedKey.expiresAt?.toISOString() ?? null,
			createdAt: updatedKey.createdAt.toISOString(),
			updatedAt: updatedKey.updatedAt.toISOString(),
			permissions: updatedKey.permissions,
			metadata: updatedKey.metadata,
			createdBy: {
				id: existingKey.user.id,
				name: existingKey.user.name,
				image: existingKey.user.image,
				email: existingKey.user.email,
			},
		};
	} catch (error) {
		logger.error({ id, error }, "Error enabling API key");
		throw error;
	}
}
