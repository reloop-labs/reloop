import { createId } from "@paralleldrive/cuid2";
import type { ApiKeyTypes } from "@reloop/api-key/types/api-key.type";
import { createLog } from "@reloop/api-key/utils/logger";
import {
	API_KEY_PREFIX,
	generateApiKey,
	getKeyStart,
	hashApiKey,
} from "@reloop/apikey";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { API_KEY_CREATE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { log } from "evlog";
import { ApiKeyErrors } from "@reloop/api-key/lib/errors";

export async function createApiKeyController({
	organizationId,
	userId,
	body,
	logger,
	cookie,
	requestDetails,
}: {
	organizationId: string;
	userId: string;
	body: ApiKeyTypes.CreateApiKeyRequest;
	logger?: any;
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
		log.info({ ...{}, message: "Generating new api key" });
		const fullKey = generateApiKey();
		const hashedKey = hashApiKey(fullKey);
		const keyStart = getKeyStart(fullKey);
		const keyId = createId();
		log.info({
			...{ hashedKey, keyStart, keyId },
			message: "APi key Generated",
		});

		const now = new Date();
		const expiresAt = null;
		const enabled = true;
		const rateLimitEnabled = true;
		const rateLimitTimeWindow = 1000;
		const rateLimitMax = 100;
		const remaining = rateLimitMax;

		log.info({
			...{ hashedKey, keyStart, keyId },
			message: "Inserting API key in database",
		});
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
			log.error({ ...{}, message: "Failed to create API key" });
			throw ApiKeyErrors.createFailed();
		}
		log.info({ ...{ newApiKey }, message: "New Api key generated" });

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

		await createLog({
			event: API_KEY_CREATE_WEBHOOK_EVENT.id,
			cookie,
			metadata: result,
			requestDetails: { ...(requestDetails || {}), statusCode: 201 },
		});

		return result;
	} catch (error) {
		log.error({ ...{ error }, message: "Error creating API key" });
		throw error;
	}
}
