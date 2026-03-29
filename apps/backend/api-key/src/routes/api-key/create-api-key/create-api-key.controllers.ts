import { createHash, randomBytes } from "node:crypto";
import { createId } from "@paralleldrive/cuid2";
import type { ApiKeyTypes } from "@reloop/api-key/types/api-key.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { eq } from "drizzle-orm";
import { status } from "elysia";

const API_KEY_PREFIX = "rl_live";
const API_KEY_LENGTH = 64;

function generateApiKey(): string {
	const randomPart = randomBytes(API_KEY_LENGTH).toString("base64url");
	return `${API_KEY_PREFIX}_${randomPart}`;
}

function hashApiKey(key: string): string {
	return createHash("sha256").update(key).digest("hex");
}

function getKeyStart(key: string): string {
	const parts = key.split("_");
	if (parts.length >= 2) {
		return `${parts[0]}_${parts[1]?.substring(0, 8) ?? ""}`;
	}
	return key.substring(0, 12);
}

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
		const fullKey = generateApiKey();
		const hashedKey = hashApiKey(fullKey);
		const keyStart = getKeyStart(fullKey);
		const keyId = createId();

		logger.info("Creating API key with key values here", hashedKey, keyStart, keyId);
		const now = new Date();
		const expiresAt = null;
		const enabled = true;
		const rateLimitEnabled = true;
		const rateLimitTimeWindow = 86400000;
		const rateLimitMax = 10;
		const remaining = rateLimitMax;

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
			logger.error({ organizationId, userId }, "Failed to create API key");
			throw status(500, { message: "Failed to create API key" });
		}

		const user = await db.query.user.findFirst({
			where: eq(schema.user.id, userId),
		});

		if (!user) {
			logger.error(
				{ organizationId, userId },
				"User not found for API key creation",
			);
			throw status(500, { message: "User not found" });
		}

		logger.info("newApiKey", newApiKey);

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
		logger.error(
			{
				organizationId,
				userId,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error creating API key",
		);
		throw error;
	}
}
