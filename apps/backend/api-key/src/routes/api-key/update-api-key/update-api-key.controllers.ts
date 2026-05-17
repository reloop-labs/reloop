import type { ApiKeyTypes } from "@reloop/api-key/types/api-key.type";

import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { API_KEY_UPDATE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq } from "drizzle-orm";
import { log } from "evlog";
import { ApiKeyErrors } from "@reloop/api-key/error/api-key.error-response";

export async function updateApiKeyController({
	apiKeyId,
	organizationId,
	body,
	cookie,
}: {
	apiKeyId: string;
	organizationId: string;
	body: ApiKeyTypes.UpdateApiKeyRequest;
	cookie?: string;
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
			throw ApiKeyErrors.notFound(apiKeyId);
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
			throw ApiKeyErrors.updateFailed(apiKeyId);
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



		return result;
	} catch (error) {
		log.error({ ...{ apiKeyId, error }, message: "Error updating API key" });
		throw error;
	}
}
