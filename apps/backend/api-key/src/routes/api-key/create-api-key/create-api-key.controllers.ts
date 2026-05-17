import { createId } from "@paralleldrive/cuid2";
import { ApiKeyErrors } from "@reloop/api-key/error/api-key.error-response";
import type { ApiKeyTypes } from "@reloop/api-key/types/api-key.type";
import {
	API_KEY_PREFIX,
	generateApiKey,
	getKeyStart,
	hashApiKey,
} from "@reloop/apikey";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { API_KEY_CREATE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { useLogger } from "evlog/elysia";

export async function createApiKeyController({
	organizationId,
	userId,
	name,
}: {
	organizationId: string;
	userId: string;
	name: string;
}): Promise<ApiKeyTypes.ApiKeyWithKeyResponse> {
	const log = useLogger();
	try {
		log.info("Generating new api key");
		const fullKey = generateApiKey();
		const hashedKey = hashApiKey(fullKey);
		const keyStart = getKeyStart(fullKey);
		const keyId = `api_key_${createId()}`;
		log.info("APi key Generated");

		const now = new Date();
		const expiresAt = null;
		const enabled = true;
		const rateLimitEnabled = true;
		const rateLimitTimeWindow = 1000;
		const rateLimitMax = 100;
		const remaining = rateLimitMax;

		log.info("Inserting API key in database");
		const newApiKey = await db
			.insert(schema.apikey)
			.values({
				id: keyId,
				name,
				start: keyStart,
				prefix: API_KEY_PREFIX,
				key: hashedKey,
				organizationId,
				userId,
				refillInterval: null,
				refillAmount: null,
				lastRefillAt: null,
				enabled,
				rateLimitEnabled,
				rateLimitTimeWindow,
				rateLimitMax,
				requestCount: 0,
				remaining,
				lastRequest: null,
				expiresAt,
				createdAt: now,
				updatedAt: now,
				permissions: null,
				metadata: null,
			})
			.returning();

		if (!newApiKey[0]) {
			log.error("Failed to create API key");
			throw ApiKeyErrors.createFailed();
		}
		log.info("New Api key generated");

		const result = {
			id: newApiKey[0].id,
			name: newApiKey[0].name,
			key: fullKey,
			enabled: newApiKey[0].enabled,
			createdAt: newApiKey[0].createdAt.toISOString(),
			updatedAt: newApiKey[0].updatedAt.toISOString(),
			permissions: newApiKey[0].permissions,
			object: "api_key" as const,
			event: API_KEY_CREATE_WEBHOOK_EVENT.id,
		};

		return result;
	} catch (error) {
		log.error("Error creating API key");
		throw ApiKeyErrors.createFailed(JSON.stringify(error));
	}
}
