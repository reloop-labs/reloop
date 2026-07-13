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

/**
 * Reverse index: apiKeyId → hashed secret.
 * Lets lifecycle recover invalidate after delete when the row is already gone.
 */
export function apiKeyCredentialIdIndexKey(apiKeyId: string): string {
	return `${CACHE_KEY_PREFIX}:id:${apiKeyId}`;
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
	/** Removes the cached credential by hashed secret. Throws if delete cannot be confirmed. */
	invalidate(hashedKey: string): Promise<void>;
	/**
	 * Clears cache when only the API key id is known (e.g. row already deleted).
	 * No-op success if no reverse index exists. Throws if a known entry cannot be cleared.
	 */
	invalidateByApiKeyId(apiKeyId: string): Promise<void>;
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

async function strictDelete(
	store: ApiKeyCredentialStore,
	key: string,
): Promise<void> {
	try {
		await store.delete(key);
	} catch (cause) {
		throw new Error(
			`API key credential cache invalidate failed for key "${key}"`,
			{ cause },
		);
	}
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

		async write(
			hashedKey,
			entry,
			ttlSeconds = API_KEY_CREDENTIAL_CACHE_TTL_SECONDS,
		) {
			await store.set(
				apiKeyCredentialCacheKey(hashedKey),
				entry,
				ttlSeconds,
			);
			await store.set(
				apiKeyCredentialIdIndexKey(entry.apiKeyId),
				hashedKey,
				ttlSeconds,
			);
		},

		async invalidate(hashedKey) {
			const hashKey = apiKeyCredentialCacheKey(hashedKey);
			const entry = await store.get<ApiKeyCredentialEntry>(hashKey);
			await strictDelete(store, hashKey);
			if (entry?.apiKeyId) {
				await strictDelete(store, apiKeyCredentialIdIndexKey(entry.apiKeyId));
			}
		},

		async invalidateByApiKeyId(apiKeyId) {
			const indexKey = apiKeyCredentialIdIndexKey(apiKeyId);
			const hashedKey = await store.get<string>(indexKey);
			if (hashedKey) {
				await this.invalidate(hashedKey);
				return;
			}
			// No reverse index: nothing to clear (or never authenticated via cache)
			await strictDelete(store, indexKey);
		},
	};
}
