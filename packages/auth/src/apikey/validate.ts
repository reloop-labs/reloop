import {
	createApiKeyCredentialCache,
	type ApiKeyCredentialStore,
} from "@reloop/auth/apikey/credential-cache";
import { hashApiKey } from "@reloop/auth/apikey/helpers";
import { db as defaultDb } from "@reloop/db/client";
import { apikey } from "@reloop/db/schema";
import { and, eq, sql } from "drizzle-orm";

/** Store used by validate (get/set; delete optional for this path). */
export type ApiKeyCache = {
	get<T>(key: string): Promise<T | undefined>;
	set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
	delete?(key: string): Promise<void>;
};

export interface ApiKeyValidationResult {
	userId: string;
	organizationId: string;
	apiKeyId: string;
	authType: "apikey";
}

function asCredentialStore(redis: ApiKeyCache): ApiKeyCredentialStore {
	return {
		get: (key) => redis.get(key),
		set: (key, value, ttl) => redis.set(key, value, ttl),
		delete: async (key) => {
			if (redis.delete) {
				await redis.delete(key);
				return;
			}
			// Callers that only implement get/set never hit invalidate via this store.
			throw new Error(
				"API key credential store does not implement delete; cannot invalidate",
			);
		},
	};
}

export async function validateApiKey(
	apiKey: string | null | undefined,
	redis: ApiKeyCache,
	db = defaultDb,
): Promise<ApiKeyValidationResult | null> {
	if (!apiKey || typeof apiKey !== "string") return null;

	if (!apiKey.includes("_") || !/^[a-zA-Z0-9_-]+$/.test(apiKey)) {
		return null;
	}

	const hashedKey = hashApiKey(apiKey);
	const credentialCache = createApiKeyCredentialCache(asCredentialStore(redis));

	const cached = await credentialCache.read(hashedKey);

	if (cached) {
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
		where: and(eq(apikey.key, hashedKey), eq(apikey.enabled, true)),
	});

	if (apiKeyRecord) {
		const entry = {
			userId: apiKeyRecord.userId,
			organizationId: apiKeyRecord.organizationId,
			apiKeyId: apiKeyRecord.id,
		};
		// Cache is acceleration only — never fail closed on write.
		// Invalidate (revoke) is the fail-closed path; auth must honor DB truth.
		try {
			await credentialCache.write(hashedKey, entry);
		} catch (err) {
			console.error("Failed to cache API key credential:", err);
		}

		db.update(apikey)
			.set({
				requestCount: sql`${apikey.requestCount} + 1`,
				lastRequest: new Date(),
			})
			.where(eq(apikey.id, apiKeyRecord.id))
			.catch((err) => console.error("Failed to update API key stats:", err));

		return {
			...entry,
			authType: "apikey",
		};
	}

	return null;
}
