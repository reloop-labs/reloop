import {
	API_KEY_CREDENTIAL_CACHE_TTL_SECONDS,
	type ApiKeyCredentialCache,
	type ApiKeyCredentialEntry,
	type ApiKeyCredentialStore,
	createApiKeyCredentialCache,
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

/**
 * Reuse one credential-cache facade per redis handle.
 * Avoids allocating createApiKeyCredentialCache on every authenticated request.
 */
const credentialCacheByRedis = new WeakMap<object, ApiKeyCredentialCache>();

function credentialCacheFor(redis: ApiKeyCache): ApiKeyCredentialCache {
	const key = redis as object;
	let cache = credentialCacheByRedis.get(key);
	if (!cache) {
		cache = createApiKeyCredentialCache(asCredentialStore(redis));
		credentialCacheByRedis.set(key, cache);
	}
	return cache;
}

/** True when expiresAt is set and is at or before now. */
export function isApiKeyExpired(
	expiresAt: Date | string | number | null | undefined,
	nowMs: number = Date.now(),
): boolean {
	if (expiresAt == null) return false;
	const ms =
		expiresAt instanceof Date
			? expiresAt.getTime()
			: typeof expiresAt === "number"
				? expiresAt
				: Date.parse(expiresAt);
	if (Number.isNaN(ms)) return false;
	return ms <= nowMs;
}

function bumpRequestStats(db: typeof defaultDb, apiKeyId: string): void {
	db.update(apikey)
		.set({
			requestCount: sql`${apikey.requestCount} + 1`,
			lastRequest: new Date(),
		})
		.where(eq(apikey.id, apiKeyId))
		.catch((err) => console.error("Failed to update API key stats:", err));
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
	const credentialCache = credentialCacheFor(redis);
	const nowMs = Date.now();

	const cached = await credentialCache.read(hashedKey);

	if (cached) {
		// Legacy cache entries without expiresAtMs remain valid until revoke/TTL.
		if (isApiKeyExpired(cached.expiresAtMs, nowMs)) {
			// Best-effort evict so the next request hits DB (or fails cleanly).
			try {
				await credentialCache.invalidate(hashedKey);
			} catch (err) {
				console.error(
					"Failed to invalidate expired API key credential cache:",
					err,
				);
			}
			return null;
		}

		bumpRequestStats(db, cached.apiKeyId);

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

	if (!apiKeyRecord) {
		return null;
	}

	if (isApiKeyExpired(apiKeyRecord.expiresAt, nowMs)) {
		return null;
	}

	const entry: ApiKeyCredentialEntry = {
		userId: apiKeyRecord.userId,
		organizationId: apiKeyRecord.organizationId,
		apiKeyId: apiKeyRecord.id,
		expiresAtMs: apiKeyRecord.expiresAt
			? apiKeyRecord.expiresAt.getTime()
			: null,
	};

	// Cache is acceleration only — never fail closed on write.
	// Invalidate (revoke) is the fail-closed path; auth must honor DB truth.
	try {
		// Cap TTL by time-to-expiry so expired keys do not outlive the secret.
		let ttlSeconds: number | undefined;
		if (entry.expiresAtMs != null) {
			const remainingSec = Math.floor((entry.expiresAtMs - nowMs) / 1000);
			if (remainingSec <= 0) {
				return null;
			}
			ttlSeconds = Math.min(API_KEY_CREDENTIAL_CACHE_TTL_SECONDS, remainingSec);
		}
		await credentialCache.write(hashedKey, entry, ttlSeconds);
	} catch (err) {
		console.error("Failed to cache API key credential:", err);
	}

	bumpRequestStats(db, apiKeyRecord.id);

	return {
		userId: entry.userId,
		organizationId: entry.organizationId,
		apiKeyId: entry.apiKeyId,
		authType: "apikey",
	};
}
