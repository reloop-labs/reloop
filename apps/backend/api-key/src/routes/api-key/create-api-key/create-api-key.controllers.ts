import { createId } from "@paralleldrive/cuid2";
import type { ApiKeyTypes } from "@reloop/api-key/types/api-key.type";
import {
	API_KEY_PREFIX,
	generateApiKey,
	getKeyStart,
	hashApiKey,
} from "@reloop/apikey";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { status } from "elysia";

export async function createApiKeyController({
	organizationId,
	userId,
	body,
	logger,
}: {
	organizationId: string;
	userId: string;
	body: ApiKeyTypes.CreateApiKeyRequest;
	logger: Logger;
}): Promise<ApiKeyTypes.ApiKeyWithKeyResponse> {
	try {
		logger.info({}, "Generating new api key");
		const fullKey = generateApiKey();
		const hashedKey = hashApiKey(fullKey);
		const keyStart = getKeyStart(fullKey);
		const keyId = createId();
		logger.info({ hashedKey, keyStart, keyId }, "APi key Generated");

		const now = new Date();
		const expiresAt = null;
		const enabled = true;
		const rateLimitEnabled = true;
		const rateLimitTimeWindow = 1000;
		const rateLimitMax = 100;
		const remaining = rateLimitMax;


		logger.info({ hashedKey, keyStart, keyId }, "Inserting API key in database");
		const newApiKey = await db
			.insert(schema.apikey)
			.values({
				id: keyId,
				name: body.name || null,
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
			logger.error({}, "Failed to create API key");
			throw status(500, { message: "Failed to create API key" });
		}
		logger.info("New Api key generated", { newApiKey });
		return {
			id: newApiKey[0].id,
			name: newApiKey[0].name,
			key: fullKey,
			enabled: newApiKey[0].enabled,
			createdAt: newApiKey[0].createdAt.toISOString(),
			updatedAt: newApiKey[0].updatedAt.toISOString(),
			permissions: newApiKey[0].permissions,
		};
	} catch (error) {
		logger.error({ error }, "Error creating API key");
		throw error;
	}
}
