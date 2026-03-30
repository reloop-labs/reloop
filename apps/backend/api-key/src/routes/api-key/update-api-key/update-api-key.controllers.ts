import type { ApiKeyTypes } from "@reloop/api-key/types/api-key.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { and, eq } from "drizzle-orm";
import { status } from "elysia";

export async function updateApiKeyController({
	apiKeyId,
	organizationId,
	body,
	logger,
}: {
	apiKeyId: string;
	organizationId: string;
	body: ApiKeyTypes.UpdateApiKeyRequest;
	logger: Logger;
}): Promise<ApiKeyTypes.ApiKeyResponse> {
	logger.info({ apiKeyId }, "Updating API key",);
	try {
		const existing = await db.query.apikey.findFirst({
			where: and(
				eq(schema.apikey.id, apiKeyId),
				eq(schema.apikey.organizationId, organizationId),
			),
			with: { user: true },
		});
		if (!existing) {
			logger.warn({ apiKeyId }, "API key not found");
			throw status(404, { message: "API key not found" });
		}
		const updateData: Partial<typeof schema.apikey.$inferInsert> = {
			updatedAt: new Date(),
		};
		if (body.name !== undefined) {
			updateData.name = body.name || null;
		}
		const updated = await db
			.update(schema.apikey)
			.set(updateData)
			.where(
				and(
					eq(schema.apikey.id, apiKeyId),
					eq(schema.apikey.organizationId, organizationId),
				),
			)
			.returning();

		if (!updated[0]) {
			logger.error({ apiKeyId }, "Failed to update API key");
			throw status(500, { message: "Failed to update API key" });
		}
		logger.info({ apiKeyId }, "API key updated successfully");
		return {
			id: updated[0].id,
			name: updated[0].name,
			start: updated[0].start,
			prefix: updated[0].prefix,
			organizationId: updated[0].organizationId,
			userId: updated[0].userId,
			refillInterval: updated[0].refillInterval,
			refillAmount: updated[0].refillAmount,
			lastRefillAt: updated[0].lastRefillAt?.toISOString() ?? null,
			enabled: updated[0].enabled,
			rateLimitEnabled: updated[0].rateLimitEnabled,
			rateLimitTimeWindow: updated[0].rateLimitTimeWindow,
			rateLimitMax: updated[0].rateLimitMax,
			requestCount: updated[0].requestCount,
			remaining: updated[0].remaining,
			lastRequest: updated[0].lastRequest?.toISOString() ?? null,
			expiresAt: updated[0].expiresAt?.toISOString() ?? null,
			createdAt: updated[0].createdAt.toISOString(),
			updatedAt: updated[0].updatedAt.toISOString(),
			permissions: updated[0].permissions,
			metadata: updated[0].metadata,
			createdBy: {
				id: existing.user.id,
				name: existing.user.name,
				image: existing.user.image,
				email: existing.user.email,
			},
		};
	} catch (error) {
		logger.error({ apiKeyId, error }, "Error updating API key");
		throw error;
	}
}
