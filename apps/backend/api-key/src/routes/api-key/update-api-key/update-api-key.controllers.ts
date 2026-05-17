import type { ApiKeyTypes } from "@reloop/api-key/types/api-key.type";
import { createLog } from "@reloop/api-key/utils/logger";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { API_KEY_UPDATE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq } from "drizzle-orm";
import { status } from "elysia";
import { log } from "evlog";

export async function updateApiKeyController({
	apiKeyId,
	organizationId,
	body,
	logger,
	cookie,
	requestDetails,
}: {
	apiKeyId: string;
	organizationId: string;
	body: ApiKeyTypes.UpdateApiKeyRequest;
	logger?: any;
	cookie?: string;
	requestDetails?: {
		endpoint?: string;
		method?: string;
		userAgent?: string;
		ipAddress?: string;
		statusCode?: number;
	};
}): Promise<ApiKeyTypes.ApiKeyResponse> {
	log.info({ ...{ apiKeyId }, message: "Searching api key" });
	try {
		const existing = await db.query.apikey.findFirst({
			where: and(
				eq(schema.apikey.id, apiKeyId),
				eq(schema.apikey.organizationId, organizationId),
			),
			with: { user: true },
		});
		if (!existing) {
			log.warn({ ...{ apiKeyId }, message: "API key not found" });
			throw status(404, { message: "API key not found" });
		}

		log.info({ ...{ apiKeyId }, message: "Updating api key" });
		const updateData: Partial<typeof schema.apikey.$inferInsert> = {
			updatedAt: new Date(),
			name: body.name,
		};
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
			log.error({ ...{ apiKeyId }, message: "Failed to update API key" });
			throw status(500, { message: "Failed to update API key" });
		}
		log.info({ ...{ apiKeyId }, message: "API key updated successfully" });
		const result = {
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
		log.error({ ...{ apiKeyId, error }, message: "Error updating API key" });
		throw error;
	}
}
