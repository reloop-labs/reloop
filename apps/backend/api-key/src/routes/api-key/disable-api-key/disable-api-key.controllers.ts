import { ApiKeyErrors } from "@reloop/api-key/error/api-key.error-response";
import type { ApiKeyTypes } from "@reloop/api-key/types/api-key.type";

import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { API_KEY_UPDATE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq } from "drizzle-orm";
import { log } from "evlog";

export async function disableApiKeyController({
	id,
	organizationId,
}: {
	id: string;
	organizationId: string;
}): Promise<ApiKeyTypes.ApiKeyResponse> {
	log.info({ ...{ id }, message: "Checking if API key exists" });
	try {
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
			log.warn({ ...{ id }, message: "API key not found" });
			throw ApiKeyErrors.notFound(id);
		}

		let updatedKeyData: typeof schema.apikey.$inferSelect;

		if (!existingKey.enabled) {
			log.info({ ...{ id }, message: "API key is already disabled" });
			updatedKeyData = existingKey;
		} else {
			const now = new Date();
			log.info({ ...{ id }, message: "Updating API key" });
			const [updatedKey] = await db
				.update(schema.apikey)
				.set({
					enabled: false,
					updatedAt: now,
				})
				.where(eq(schema.apikey.id, id))
				.returning();

			if (!updatedKey) {
				log.error({ ...{ id }, message: "Failed to disable API key" });
				throw ApiKeyErrors.disableFailed(id);
			}
			updatedKeyData = updatedKey;
		}

		log.info({ ...{ id }, message: "API key disabled successfully" });

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



		return result;
	} catch (error) {
		log.error({ ...{ id, error }, message: "Error disabling API key" });
		throw error;
	}
}
