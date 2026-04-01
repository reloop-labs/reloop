import type { ApiKeyTypes } from "@reloop/api-key/types/api-key.type";
import { createLog } from "@reloop/api-key/utils/logger";
import { generateApiKey, getKeyStart, hashApiKey } from "@reloop/apikey";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { API_KEY_UPDATE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq } from "drizzle-orm";
import { status } from "elysia";

export async function rotateApiKeyController({
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
	};
}): Promise<ApiKeyTypes.ApiKeyWithKeyResponse> {
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
		logger.info({ id }, "Generating new key");
		const fullKey = generateApiKey();
		const hashedKey = hashApiKey(fullKey);
		const keyStart = getKeyStart(fullKey);
		const now = new Date();
		logger.info({ id }, "Updating API key");
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
			logger.error({ id }, "Failed to rotate API key");
			throw status(500, { message: "Failed to rotate API key" });
		}
		logger.info({ id }, "API key rotated successfully");
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

		await createLog({
			event: API_KEY_UPDATE_WEBHOOK_EVENT.id,
			cookie,
			metadata: result,
			requestDetails,
		});

		return result;
	} catch (error) {
		logger.error({ id, error }, "Error rotating API key");
		throw error;
	}
}
