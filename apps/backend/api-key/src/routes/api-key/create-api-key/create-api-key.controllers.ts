import { createHash, randomBytes } from "node:crypto";
import { createId } from "@paralleldrive/cuid2";
import type { ApiKeyTypes } from "@reloop/api-key/types/api-key.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { eq } from "drizzle-orm";
import { status } from "elysia";

const API_KEY_PREFIX = "rl";
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
export async function createApiKey(
	organizationId: string,
	userId: string,
	request: ApiKeyTypes.CreateApiKeyRequest,
): Promise<ApiKeyTypes.ApiKeyWithKeyResponse> {
	try {
		const fullKey = generateApiKey();
		const hashedKey = hashApiKey(fullKey);
		const keyStart = getKeyStart(fullKey);
		const keyId = createId();

		logger.info(
			"Creating API key with key values here",
			organizationId,
			userId,
			fullKey,
			hashedKey,
			keyStart,
			keyId,
		);
		const now = new Date();
		const expiresAt = request.expiresAt ? new Date(request.expiresAt) : null;

		const enabled = request.enabled ?? true;
		const rateLimitEnabled = request.rateLimitEnabled ?? true;
		const rateLimitTimeWindow = request.rateLimitTimeWindow ?? 86400000;
		const rateLimitMax = request.rateLimitMax ?? 10;
		const remaining = request.refillAmount ?? rateLimitMax;

		const newApiKey = await db
			.insert(schema.apikey)
			.values({
				id: keyId,
				name: request.name || null,
				start: keyStart,
				prefix: API_KEY_PREFIX,
				key: hashedKey,
				organizationId,
				userId,
				refillInterval: request.refillInterval ?? null,
				refillAmount: request.refillAmount ?? null,
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
				permissions: request.permissions ?? null,
				metadata: request.metadata ?? null,
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
			start: newApiKey[0].start,
			prefix: newApiKey[0].prefix,
			organizationId: newApiKey[0].organizationId,
			userId: newApiKey[0].userId,
			refillInterval: newApiKey[0].refillInterval,
			refillAmount: newApiKey[0].refillAmount,
			lastRefillAt: newApiKey[0].lastRefillAt?.toISOString() ?? null,
			enabled: newApiKey[0].enabled,
			rateLimitEnabled: newApiKey[0].rateLimitEnabled,
			rateLimitTimeWindow: newApiKey[0].rateLimitTimeWindow,
			rateLimitMax: newApiKey[0].rateLimitMax,
			requestCount: newApiKey[0].requestCount,
			remaining: newApiKey[0].remaining,
			lastRequest: newApiKey[0].lastRequest?.toISOString() ?? null,
			expiresAt: newApiKey[0].expiresAt?.toISOString() ?? null,
			createdAt: newApiKey[0].createdAt.toISOString(),
			updatedAt: newApiKey[0].updatedAt.toISOString(),
			permissions: newApiKey[0].permissions,
			metadata: newApiKey[0].metadata,
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

export async function createApiKeyHandler(
	organizationId: string,
	userId: string,
	body: ApiKeyTypes.CreateApiKeyRequest,
): Promise<ApiKeyTypes.ApiKeyWithKeyResponse> {
	try {
		const apiKey = await createApiKey(organizationId, userId, body);
		return apiKey;
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
