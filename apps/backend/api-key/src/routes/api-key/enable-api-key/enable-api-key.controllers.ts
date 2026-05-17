import { ApiKeyErrors } from "@reloop/api-key/error/api-key.error-response";
import type { ApiKeyTypes } from "@reloop/api-key/types/api-key.type";
import { BusEvent, bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { API_KEY_UPDATE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

export async function enableApiKeyController({
	id,
	organizationId,
}: {
	id: string;
	organizationId: string;
}): Promise<ApiKeyTypes.ApiKeyResponse> {
	const log = useLogger();
	try {
		log.info("Search for api key");
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
			log.warn("API key not found");
			throw ApiKeyErrors.notFound(id);
		}

		let updatedKeyData: typeof schema.apikey.$inferSelect;

		if (existingKey.enabled) {
			log.info("API key is already enabled");
			updatedKeyData = existingKey;
		} else {
			const now = new Date();
			log.info("Updating API key");
			const [updatedKey] = await db
				.update(schema.apikey)
				.set({
					enabled: true,
					updatedAt: now,
				})
				.where(eq(schema.apikey.id, id))
				.returning();

			if (!updatedKey) {
				log.error("Failed to enable API key");
				throw ApiKeyErrors.enableFailed(id);
			}
			updatedKeyData = updatedKey;
		}

		log.info("API key enabled successfully");

		await bus.publish(BusEvent.API_KEY_ENABLED, {
			api_key_id: id,
			organizationId,
		});
		log.info("NATS event published");

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
		log.error("Error enabling API key");
		throw error;
	}
}
