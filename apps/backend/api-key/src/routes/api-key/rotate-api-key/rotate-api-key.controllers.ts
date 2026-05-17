import { ApiKeyErrors } from "@reloop/api-key/error/api-key.error-response";
import type { ApiKeyTypes } from "@reloop/api-key/types/api-key.type";

import { generateApiKey, getKeyStart, hashApiKey } from "@reloop/apikey";
import { BusEvent, bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { API_KEY_UPDATE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

export async function rotateApiKeyController({
	id,
	organizationId,
}: {
	id: string;
	organizationId: string;
}): Promise<ApiKeyTypes.ApiKeyWithKeyResponse> {
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
		log.info("Generating new key");
		const fullKey = generateApiKey();
		const hashedKey = hashApiKey(fullKey);
		const keyStart = getKeyStart(fullKey);
		const now = new Date();
		log.info("Updating API key");
		const [updatedKey] = await db
			.update(schema.apikey)
			.set({
				key: hashedKey,
				start: keyStart,
				updatedAt: now,
			})
			.where(eq(schema.apikey.id, id))
			.returning();
		if (!updatedKey) {
			log.error("Failed to rotate API key");
			throw ApiKeyErrors.rotateFailed(id);
		}
		log.info("API key rotated successfully");

		await bus.publish(BusEvent.API_KEY_ROTATED, {
			api_key_id: id,
			organizationId,
		});

		const result = {
			id: updatedKey.id,
			name: updatedKey.name,
			key: fullKey,
			enabled: updatedKey.enabled,
			createdAt: updatedKey.createdAt.toISOString(),
			updatedAt: updatedKey.updatedAt.toISOString(),
			permissions: updatedKey.permissions,
			object: "api_key" as const,
			event: API_KEY_UPDATE_WEBHOOK_EVENT.id,
		};

		return result;
	} catch (error) {
		log.error("Error rotating API key");
		throw error;
	}
}
