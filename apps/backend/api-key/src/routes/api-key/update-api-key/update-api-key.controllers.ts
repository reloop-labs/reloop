import { ApiKeyErrors } from "@reloop/api-key/error/api-key.error-response";
import type { ApiKeyTypes } from "@reloop/api-key/types/api-key.type";
import { BusEvent, bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { API_KEY_UPDATE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

export async function updateApiKeyController({
	apiKeyId,
	organizationId,
	name,
}: {
	apiKeyId: string;
	organizationId: string;
	name: string;
}): Promise<ApiKeyTypes.ApiKeyResponse> {
	const log = useLogger();
	log.info("Updating api key");
	try {
		const [updated] = await db
			.update(schema.apikey)
			.set({ name, updatedAt: new Date() })
			.where(
				and(
					eq(schema.apikey.id, apiKeyId),
					eq(schema.apikey.organizationId, organizationId),
				),
			)
			.returning();

		if (!updated) {
			log.warn("API key not found");
			throw ApiKeyErrors.notFound(apiKeyId);
		}

		log.info("API key updated successfully");

		await bus.publish(BusEvent.API_KEY_UPDATED, {
			api_key_id: apiKeyId,
			organizationId,
		});
		log.info("NATS event published");

		// Fetch user separately (needed for createdBy in response)
		const keyWithUser = await db.query.apikey.findFirst({
			where: eq(schema.apikey.id, apiKeyId),
			with: { user: true },
		});

		const result = {
			id: updated.id,
			name: updated.name,
			start: updated.start,
			prefix: updated.prefix,
			refillInterval: updated.refillInterval,
			refillAmount: updated.refillAmount,
			lastRefillAt: updated.lastRefillAt?.toISOString() ?? null,
			enabled: updated.enabled,
			rateLimitEnabled: updated.rateLimitEnabled,
			rateLimitTimeWindow: updated.rateLimitTimeWindow,
			rateLimitMax: updated.rateLimitMax,
			requestCount: updated.requestCount,
			remaining: updated.remaining,
			lastRequest: updated.lastRequest?.toISOString() ?? null,
			expiresAt: updated.expiresAt?.toISOString() ?? null,
			createdAt: updated.createdAt.toISOString(),
			updatedAt: updated.updatedAt.toISOString(),
			permissions: updated.permissions,
			metadata: updated.metadata,
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
		log.error("Error updating API key");
		throw error;
	}
}
