/**
 * API Key credential cache — single seam for auth validation and lifecycle invalidate.
 * Keys are always the **hashed** secret (as stored on the apikey row), never the raw secret.
 */

export const API_KEY_CREDENTIAL_CACHE_TTL_SECONDS = 30 * 24 * 60 * 60;

const CACHE_KEY_PREFIX = "apikey:v1";

/** Redis / memory key for a hashed API Key secret. */
export function apiKeyCredentialCacheKey(hashedKey: string): string {
	return `${CACHE_KEY_PREFIX}:${hashedKey}`;
}

export type ApiKeyCredentialEntry = {
	userId: string;
	organizationId: string;
	apiKeyId: string;
};

/**
 * Low-level store (e.g. AuthRedis / MemoryRedis).
 * `delete` must reject when the operation cannot be confirmed so invalidate can fail closed.
 */
export type ApiKeyCredentialStore = {
	get<T>(key: string): Promise<T | undefined>;
	set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
	delete(key: string): Promise<void>;
};

export type ApiKeyCredentialCache = {
	read(hashedKey: string): Promise<ApiKeyCredentialEntry | undefined>;
	write(
		hashedKey: string,
		entry: ApiKeyCredentialEntry,
		ttlSeconds?: number,
	): Promise<void>;
	/** Removes the cached credential. Throws if delete cannot be confirmed. */
	invalidate(hashedKey: string): Promise<void>;
};

/**
 * Auth Redis / session cache often uses best-effort `delete`.
 * Prefer `deleteStrict` when available so credential invalidate fails closed.
 */
export function authRedisAsCredentialStore(redis: {
	get<T>(key: string): Promise<T | undefined>;
	set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
	delete(key: string): Promise<void>;
	deleteStrict?(key: string): Promise<void>;
}): ApiKeyCredentialStore {
	return {
		get: (key) => redis.get(key),
		set: (key, value, ttl) => redis.set(key, value, ttl),
		delete: async (key) => {
			if (redis.deleteStrict) {
				await redis.deleteStrict(key);
				return;
			}
			await redis.delete(key);
		},
	};
}

export function createApiKeyCredentialCache(
	store: ApiKeyCredentialStore,
): ApiKeyCredentialCache {
	return {
		async read(hashedKey) {
			return store.get<ApiKeyCredentialEntry>(
				apiKeyCredentialCacheKey(hashedKey),
			);
		},

		async write(hashedKey, entry, ttlSeconds = API_KEY_CREDENTIAL_CACHE_TTL_SECONDS) {
			await store.set(
				apiKeyCredentialCacheKey(hashedKey),
				entry,
				ttlSeconds,
			);
		},

		async invalidate(hashedKey) {
			const key = apiKeyCredentialCacheKey(hashedKey);
			try {
				await store.delete(key);
			} catch (cause) {
				throw new Error(
					`API key credential cache invalidate failed for key "${key}"`,
					{ cause },
				);
			}
		},
	};
}
