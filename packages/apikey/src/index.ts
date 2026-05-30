import { createHash, randomBytes } from "node:crypto";
import type { RedisCache } from "@reloop/cache/redis-client";
import { db as defaultDb } from "@reloop/db/client";
import { apikey } from "@reloop/db/schema";
import { eq, sql } from "drizzle-orm";

export const API_KEY_PREFIX = "rl_prod";
export const API_KEY_LENGTH = 20;

export function hashApiKey(key: string): string {
	return createHash("sha256").update(key).digest("hex");
}

export function generateApiKey(): string {
	const randomPart = randomBytes(API_KEY_LENGTH).toString("base64url");
	return `${API_KEY_PREFIX}_${randomPart}`;
}

export function getKeyStart(key: string): string {
	return key.substring(0, 17);
}

export function getApiKeyCacheKey(apiKey: string): string {
	return `apikey:v1:${apiKey}`;
}

export interface ApiKeyValidationResult {
	userId: string;
	organizationId: string;
	apiKeyId: string;
	authType: "apikey";
}

export async function validateApiKey(
	apiKey: string | null | undefined,
	redis: RedisCache,
	db = defaultDb,
): Promise<ApiKeyValidationResult | null> {
	if (!apiKey || typeof apiKey !== "string") return null;

	// Basic format check
	if (!apiKey.includes("_") || !/^[a-zA-Z0-9_-]+$/.test(apiKey)) {
		return null;
	}

	const hashedKey = hashApiKey(apiKey);
	const cacheKey = getApiKeyCacheKey(hashedKey);

	const cached = await redis.get<{
		userId: string;
		organizationId: string;
		apiKeyId: string;
	}>(cacheKey);

	if (cached) {
		// Update request stats in database asynchronously
		db.update(apikey)
			.set({
				requestCount: sql`${apikey.requestCount} + 1`,
				lastRequest: new Date(),
			})
			.where(eq(apikey.id, cached.apiKeyId))
			.catch((err) => console.error("Failed to update API key stats:", err));

		return {
			userId: cached.userId,
			organizationId: cached.organizationId,
			apiKeyId: cached.apiKeyId,
			authType: "apikey",
		};
	}

	const apiKeyRecord = await db.query.apikey.findFirst({
		where: (apikeys, { eq, and }) =>
			and(eq(apikeys.key, hashedKey), eq(apikeys.enabled, true)),
	});

	if (apiKeyRecord) {
		const result = {
			userId: apiKeyRecord.userId,
			organizationId: apiKeyRecord.organizationId,
			apiKeyId: apiKeyRecord.id,
		};
		await redis.set(cacheKey, result, 30 * 24 * 60 * 60);

		// Update request stats in database asynchronously
		db.update(apikey)
			.set({
				requestCount: sql`${apikey.requestCount} + 1`,
				lastRequest: new Date(),
			})
			.where(eq(apikey.id, apiKeyRecord.id))
			.catch((err) => console.error("Failed to update API key stats:", err));

		return {
			...result,
			authType: "apikey",
		};
	}

	return null;
}
