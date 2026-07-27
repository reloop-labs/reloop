import { describe, expect, test } from "bun:test";
import { generateApiKey, hashApiKey } from "@reloop/auth/apikey";
import {
	type ApiKeyCredentialEntry,
	createApiKeyCredentialCache,
} from "@reloop/auth/apikey/credential-cache";
import { isApiKeyExpired, validateApiKey } from "@reloop/auth/apikey/validate";

function memoryRedis() {
	const map = new Map<string, string>();
	return {
		async get<T>(key: string): Promise<T | undefined> {
			const raw = map.get(key);
			if (raw === undefined) return undefined;
			return JSON.parse(raw) as T;
		},
		async set(key: string, value: unknown): Promise<void> {
			map.set(key, JSON.stringify(value));
		},
		async delete(key: string): Promise<void> {
			map.delete(key);
		},
	};
}

function statsDb() {
	return {
		update: () => ({
			set: () => ({
				where: () => ({
					catch: () => {},
				}),
			}),
		}),
	};
}

/**
 * validateApiKey must treat the credential cache as acceleration only.
 * Fail-closed writes belong on revoke (invalidate), not authenticate.
 */
describe("validateApiKey cache write is best-effort", () => {
	test("returns AuthContext when DB has a valid key even if cache write fails", async () => {
		const raw = generateApiKey();
		const hashed = hashApiKey(raw);

		const brokenRedis = {
			async get<T>(_key: string): Promise<T | undefined> {
				return undefined;
			},
			async set(): Promise<void> {
				// soft no-op — write verification cannot confirm
			},
			async delete(): Promise<void> {},
		};

		const fakeDb = {
			query: {
				apikey: {
					findFirst: async () => ({
						id: "key-1",
						userId: "user-1",
						organizationId: "org-1",
						key: hashed,
						enabled: true,
						expiresAt: null,
					}),
				},
			},
			...statsDb(),
		};

		const result = await validateApiKey(raw, brokenRedis, fakeDb as never);

		expect(result).toEqual({
			userId: "user-1",
			organizationId: "org-1",
			apiKeyId: "key-1",
			authType: "apikey",
		});
	});

	test("returns null for unknown keys without throwing", async () => {
		const raw = generateApiKey();
		const redis = memoryRedis();
		const fakeDb = {
			query: {
				apikey: {
					findFirst: async () => undefined,
				},
			},
		};

		await expect(
			validateApiKey(raw, redis, fakeDb as never),
		).resolves.toBeNull();
	});
});

describe("validateApiKey expiresAt", () => {
	test("isApiKeyExpired treats null/undefined as not expired", () => {
		expect(isApiKeyExpired(null)).toBe(false);
		expect(isApiKeyExpired(undefined)).toBe(false);
	});

	test("isApiKeyExpired is true at or after the instant", () => {
		const t = Date.parse("2026-01-01T00:00:00.000Z");
		expect(isApiKeyExpired(new Date(t), t)).toBe(true);
		expect(isApiKeyExpired(t, t + 1)).toBe(true);
		expect(isApiKeyExpired(t, t - 1)).toBe(false);
	});

	test("DB path rejects enabled keys past expiresAt", async () => {
		const raw = generateApiKey();
		const hashed = hashApiKey(raw);
		const redis = memoryRedis();
		const fakeDb = {
			query: {
				apikey: {
					findFirst: async () => ({
						id: "key-1",
						userId: "user-1",
						organizationId: "org-1",
						key: hashed,
						enabled: true,
						expiresAt: new Date(Date.now() - 60_000),
					}),
				},
			},
			...statsDb(),
		};

		await expect(
			validateApiKey(raw, redis, fakeDb as never),
		).resolves.toBeNull();
	});

	test("DB path accepts keys with future expiresAt and caches expiresAtMs", async () => {
		const raw = generateApiKey();
		const hashed = hashApiKey(raw);
		const redis = memoryRedis();
		const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
		const fakeDb = {
			query: {
				apikey: {
					findFirst: async () => ({
						id: "key-1",
						userId: "user-1",
						organizationId: "org-1",
						key: hashed,
						enabled: true,
						expiresAt,
					}),
				},
			},
			...statsDb(),
		};

		const result = await validateApiKey(raw, redis, fakeDb as never);
		expect(result).toEqual({
			userId: "user-1",
			organizationId: "org-1",
			apiKeyId: "key-1",
			authType: "apikey",
		});

		const cache = createApiKeyCredentialCache(redis);
		const entry = await cache.read(hashed);
		expect(entry?.expiresAtMs).toBe(expiresAt.getTime());
	});

	test("cache path rejects when cached expiresAtMs is in the past", async () => {
		const raw = generateApiKey();
		const hashed = hashApiKey(raw);
		const redis = memoryRedis();
		const cache = createApiKeyCredentialCache(redis);
		const entry: ApiKeyCredentialEntry = {
			userId: "user-1",
			organizationId: "org-1",
			apiKeyId: "key-1",
			expiresAtMs: Date.now() - 1_000,
		};
		await cache.write(hashed, entry);

		// DB would still have the key — expiry on cache must not fall through open
		const fakeDb = {
			query: {
				apikey: {
					findFirst: async () => ({
						id: "key-1",
						userId: "user-1",
						organizationId: "org-1",
						key: hashed,
						enabled: true,
						expiresAt: new Date(Date.now() - 1_000),
					}),
				},
			},
			...statsDb(),
		};

		await expect(
			validateApiKey(raw, redis, fakeDb as never),
		).resolves.toBeNull();
	});

	test("legacy cache entries without expiresAtMs still authenticate", async () => {
		const raw = generateApiKey();
		const hashed = hashApiKey(raw);
		const redis = memoryRedis();
		const cache = createApiKeyCredentialCache(redis);
		await cache.write(hashed, {
			userId: "user-1",
			organizationId: "org-1",
			apiKeyId: "key-1",
		});

		const result = await validateApiKey(raw, redis, {
			query: {
				apikey: {
					findFirst: async () => undefined,
				},
			},
			...statsDb(),
		} as never);

		expect(result).toEqual({
			userId: "user-1",
			organizationId: "org-1",
			apiKeyId: "key-1",
			authType: "apikey",
		});
	});
});
