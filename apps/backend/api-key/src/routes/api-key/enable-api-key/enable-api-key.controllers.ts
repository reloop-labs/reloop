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
		const [updatedKey] = await db
			.update(schema.apikey)
			.set({ enabled: true, updatedAt: new Date() })
			.where(
				and(
					eq(schema.apikey.id, id),
					eq(schema.apikey.organizationId, organizationId),
				),
			)
			.returning();

		let updatedKeyData: typeof schema.apikey.$inferSelect;
		if (!updatedKey) {
			const existing = await db.query.apikey.findFirst({
				where: and(
					eq(schema.apikey.id, id),
					eq(schema.apikey.organizationId, organizationId),
				),
				with: { user: true },
			});
			if (!existing) {
				log.warn("API key not found");
				throw ApiKeyErrors.notFound(id);
			}
			log.info("API key is already enabled");
			updatedKeyData = existing;
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
					id: existing.user.id,
					name: existing.user.name,
					image: existing.user.image,
					email: existing.user.email,
				},
				object: "api_key" as const,
				event: API_KEY_UPDATE_WEBHOOK_EVENT.id,
			};
			return result;
		}

		log.info("API key enabled successfully");
		await bus.publish(BusEvent.API_KEY_ENABLED, { api_key_id: id, organizationId });
		log.info("NATS event published");

		const keyWithUser = await db.query.apikey.findFirst({
			where: eq(schema.apikey.id, id),
			with: { user: true },
		});

		const result = {
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
			createdBy: keyWithUser?.user
				? {
					id: keyWithUser.user.id,
					name: keyWithUser.user.name,
					image: keyWithUser.user.image,
					email: keyWithUser.user.email,
				}
				: undefined,
			object: "api_key" as const,
			event: API_KEY_UPDATE_WEBHOOK_EVENT.id,
		};

		return result;
	} catch (error) {
		log.error("Error enabling API key");
		throw error;
	}
}
