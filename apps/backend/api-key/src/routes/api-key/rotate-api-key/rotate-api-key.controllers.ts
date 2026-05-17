import type { ApiKeyTypes } from "@reloop/api-key/types/api-key.type";
import { createLog } from "@reloop/api-key/utils/logger";
import { generateApiKey, getKeyStart, hashApiKey } from "@reloop/apikey";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { API_KEY_UPDATE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq } from "drizzle-orm";
import { status } from "elysia";
import { log } from "evlog";

export async function rotateApiKeyController({
	id,
	organizationId,
	cookie,
	requestDetails,
}: {
	id: string;
	organizationId: string;
	cookie?: string;
	requestDetails?: {
		endpoint?: string;
		method?: string;
		userAgent?: string;
		ipAddress?: string;
		statusCode?: number;
	};
}): Promise<ApiKeyTypes.ApiKeyWithKeyResponse> {
	try {
		log.info({ ...{ id, organizationId }, message: "Search for api key" });
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
			throw status(404, { message: "API key not found" });
		}
		log.info({ ...{ id }, message: "Generating new key" });
		const fullKey = generateApiKey();
		const hashedKey = hashApiKey(fullKey);
		const keyStart = getKeyStart(fullKey);
		const now = new Date();
		log.info({ ...{ id }, message: "Updating API key" });
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
			log.error({ ...{ id }, message: "Failed to rotate API key" });
			throw status(500, { message: "Failed to rotate API key" });
		}
		log.info({ ...{ id }, message: "API key rotated successfully" });
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
			requestDetails: { ...(requestDetails || {}), statusCode: 200 },
		});

		return result;
	} catch (error) {
		log.error({
			id,
			error: error instanceof Error ? error.message : String(error),
			message: "Error rotating API key",
		});
		throw error;
	}
}
