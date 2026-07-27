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
	/**
	 * Absolute expiry as unix ms, or null if the key never expires.
	 * Optional for legacy cache rows written before expiry was stored;
	 * validate treats missing as "no expiry known" and relies on TTL/revoke.
	 */
	expiresAtMs?: number | null;
};

/**
 * Reverse index payload (apiKeyId → hashed secret).
 * Stored as an object so RedisCache JSON round-trips never mis-parse a raw hex
 * string as a number (e.g. scientific notation).
 */
export type ApiKeyCredentialReverseEntry = {
	hashedKey: string;
};

/** Accept object form and legacy bare-string reverse indexes. */
function parseReverseEntry(
	value: ApiKeyCredentialReverseEntry | string | undefined,
): string | undefined {
	if (value == null) return undefined;
	if (typeof value === "string") return value;
	if (typeof value === "object" && typeof value.hashedKey === "string") {
		return value.hashedKey;
	}
	return undefined;
}

/**
 * Low-level store (e.g. AuthRedis / MemoryRedis).
 * `set` / `delete` must reject when the operation cannot be confirmed for fail-closed paths.
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
	 * Uses reverse index written on every successful write.
	 * Throws if a reverse index exists but cleanup cannot be confirmed.
	 */
	invalidateByApiKeyId(apiKeyId: string): Promise<void>;
};

/**
 * Auth Redis / session cache often uses best-effort get/set/delete.
 * Prefer *Strict methods when available so credential cache can fail closed.
 */
export function authRedisAsCredentialStore(redis: {
	get<T>(key: string): Promise<T | undefined>;
	set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
	setStrict?(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
	delete(key: string): Promise<void>;
	deleteStrict?(key: string): Promise<void>;
}): ApiKeyCredentialStore {
	return {
		get: (key) => redis.get(key),
		set: async (key, value, ttl) => {
			if (redis.setStrict) {
				await redis.setStrict(key, value, ttl);
				return;
			}
			await redis.set(key, value, ttl);
		},
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
			const hashKey = apiKeyCredentialCacheKey(hashedKey);
			const idKey = apiKeyCredentialIdIndexKey(entry.apiKeyId);

			// Primary first, then reverse index, then verify both so we never leave
			// a valid credential without a recoverable id→hash mapping.
			const reverseEntry: ApiKeyCredentialReverseEntry = { hashedKey };
			try {
				await store.set(hashKey, entry, ttlSeconds);
				await store.set(idKey, reverseEntry, ttlSeconds);
			} catch (cause) {
				// Best-effort compensate if reverse failed after primary
				try {
					await store.delete(hashKey);
				} catch {
					// ignore
				}
				try {
					await store.delete(idKey);
				} catch {
					// ignore
				}
				throw new Error(
					`API key credential cache write failed for key "${hashKey}"`,
					{ cause },
				);
			}

			const primary = await store.get<ApiKeyCredentialEntry>(hashKey);
			const reverse = parseReverseEntry(
				await store.get<ApiKeyCredentialReverseEntry | string>(idKey),
			);
			if (
				!primary ||
				primary.apiKeyId !== entry.apiKeyId ||
				reverse !== hashedKey
			) {
				try {
					await store.delete(hashKey);
				} catch {
					// ignore
				}
				try {
					await store.delete(idKey);
				} catch {
					// ignore
				}
				throw new Error(
					`API key credential cache write not confirmed for key "${hashKey}"`,
				);
			}
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
			const hashedKey = parseReverseEntry(
				await store.get<ApiKeyCredentialReverseEntry | string>(indexKey),
			);

			if (!hashedKey) {
				// No reverse index: under verified writes (primary + reverse confirmed
				// together), that means we never successfully cached this key id.
				// Pre-migration hash-only entries (before reverse index) cannot be
				// found by id alone and expire via TTL — scanning the keyspace is
				// intentionally out of scope.
				return;
			}

			// Clear primary (and reverse via entry if present)
			await this.invalidate(hashedKey);
			// Ensure reverse is gone even if primary was already absent
			await strictDelete(store, indexKey);
		},
	};
}
