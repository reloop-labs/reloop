import { createHash, randomBytes } from "node:crypto";
import type { RedisCache } from "@reloop/cache/redis-client";
import { db as defaultDb } from "@reloop/db/client";

export const API_KEY_PREFIX = "rl_live";
export const API_KEY_LENGTH = 64;

export function hashApiKey(key: string): string {
	return createHash("sha256").update(key).digest("hex");
}

export function generateApiKey(): string {
	const randomPart = randomBytes(API_KEY_LENGTH).toString("base64url");
	return `${API_KEY_PREFIX}_${randomPart}`;
}

export function getKeyStart(key: string): string {
	const parts = key.split("_");
	if (parts.length >= 2) {
		return `${parts[0]}_${parts[1]?.substring(0, 17) ?? ""}`;
	}
	return key.substring(0, 17);
}

export function getApiKeyCacheKey(apiKey: string): string {
	return `apikey:v1:${apiKey}`;
}

export interface ApiKeyValidationResult {
	userId: string;
	activeOrganizationId: string;
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
		activeOrganizationId: string;
	}>(cacheKey);

	if (cached) {
		return {
			userId: cached.userId,
			activeOrganizationId: cached.activeOrganizationId,
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
			activeOrganizationId: apiKeyRecord.organizationId,
		};
		await redis.set(cacheKey, result, 30 * 24 * 60 * 60);
		return {
			...result,
			authType: "apikey",
		};
	}

	return null;
}
