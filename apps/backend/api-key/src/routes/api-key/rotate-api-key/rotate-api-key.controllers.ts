import { createHash, randomBytes } from "node:crypto";
import type { ApiKeyTypes } from "@reloop/api-key/types/api-key.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq } from "drizzle-orm";
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

export async function rotateApiKey(
	id: string,
	organizationId: string,
	userId: string,
): Promise<ApiKeyTypes.ApiKeyWithKeyResponse> {
	try {
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
			logger.warn({ id, organizationId, userId }, "API key not found");
			throw status(404, { message: "API key not found" });
		}

		const fullKey = generateApiKey();
		const hashedKey = hashApiKey(fullKey);
		const keyStart = getKeyStart(fullKey);
		const now = new Date();

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

		logger.info({ id, organizationId, userId }, "API key rotated successfully");

		return {
			id: updatedKey.id,
			name: updatedKey.name,
			key: fullKey,
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
		};
	} catch (error) {
		logger.error(
			{
				id,
				organizationId,
				userId,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error rotating API key",
		);
		throw error;
	}
}

export async function rotateApiKeyHandler(
	id: string,
	organizationId: string,
	userId: string,
): Promise<ApiKeyTypes.ApiKeyWithKeyResponse> {
	logger.info({ id, organizationId, userId }, "Rotating API key");
	return rotateApiKey(id, organizationId, userId);
}
