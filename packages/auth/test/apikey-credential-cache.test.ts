import { describe, expect, test } from "bun:test";
import {
	API_KEY_CREDENTIAL_CACHE_TTL_SECONDS,
	apiKeyCredentialCacheKey,
	authRedisAsCredentialStore,
	createApiKeyCredentialCache,
	type ApiKeyCredentialEntry,
	type ApiKeyCredentialStore,
} from "@reloop/auth/apikey/credential-cache";
import { MemoryRedis } from "./memory-redis";

const sampleEntry: ApiKeyCredentialEntry = {
	userId: "user-1",
	organizationId: "org-1",
	apiKeyId: "key-1",
};

describe("ApiKeyCredentialCache", () => {
	test("apiKeyCredentialCacheKey namespaces under apikey:v1", () => {
		expect(apiKeyCredentialCacheKey("abc")).toBe("apikey:v1:abc");
	});

	test("write then read returns the credential entry", async () => {
		const cache = createApiKeyCredentialCache(new MemoryRedis());
		const hashed = "deadbeef";

		await cache.write(hashed, sampleEntry);
		await expect(cache.read(hashed)).resolves.toEqual(sampleEntry);
	});

	test("read returns undefined when missing", async () => {
		const cache = createApiKeyCredentialCache(new MemoryRedis());
		await expect(cache.read("missing")).resolves.toBeUndefined();
	});

	test("invalidate removes a written entry", async () => {
		const cache = createApiKeyCredentialCache(new MemoryRedis());
		const hashed = "to-drop";

		await cache.write(hashed, sampleEntry);
		await cache.invalidate(hashed);
		await expect(cache.read(hashed)).resolves.toBeUndefined();
	});

	test("invalidate is a no-op success when entry was never written", async () => {
		const cache = createApiKeyCredentialCache(new MemoryRedis());
		await expect(cache.invalidate("never-there")).resolves.toBeUndefined();
	});

	test("invalidate fails closed when store delete rejects", async () => {
		const store: ApiKeyCredentialStore = {
			async get() {
				return undefined;
			},
			async set() {},
			async delete() {
				throw new Error("redis unavailable");
			},
		};
		const cache = createApiKeyCredentialCache(store);

		await expect(cache.invalidate("any-hash")).rejects.toThrow(
			/credential cache invalidate failed/,
		);
	});

	test("invalidate fails closed when AuthRedis-shaped store delete rejects (production path)", async () => {
		// Mirrors RedisCache: get/set ok, delete throws on failure (post-#65 fail-closed)
		const store: ApiKeyCredentialStore = {
			async get() {
				return sampleEntry;
			},
			async set() {},
			async delete() {
				throw new Error("Redis delete error for reloop-session cache");
			},
		};
		const cache = createApiKeyCredentialCache(store);
		await expect(cache.invalidate("prod-hash")).rejects.toThrow(
			/credential cache invalidate failed/,
		);
	});

	test("authRedisAsCredentialStore prefers deleteStrict over best-effort delete", async () => {
		let strictCalled = false;
		let softCalled = false;
		const store = authRedisAsCredentialStore({
			async get() {
				return undefined;
			},
			async set() {},
			async delete() {
				softCalled = true;
			},
			async deleteStrict() {
				strictCalled = true;
				throw new Error("redis unavailable");
			},
		});
		const cache = createApiKeyCredentialCache(store);
		await expect(cache.invalidate("h")).rejects.toThrow(
			/credential cache invalidate failed/,
		);
		expect(strictCalled).toBe(true);
		expect(softCalled).toBe(false);
	});

	test("write uses default 30-day TTL when caller omits ttl", async () => {
		let seenTtl: number | undefined;
		const store: ApiKeyCredentialStore = {
			async get() {
				return undefined;
			},
			async set(_key, _value, ttlSeconds) {
				seenTtl = ttlSeconds;
			},
			async delete() {},
		};
		const cache = createApiKeyCredentialCache(store);

		await cache.write("h", sampleEntry);
		expect(seenTtl).toBe(API_KEY_CREDENTIAL_CACHE_TTL_SECONDS);
		expect(API_KEY_CREDENTIAL_CACHE_TTL_SECONDS).toBe(30 * 24 * 60 * 60);
	});

	test("keys are hash-based: different hashes do not collide", async () => {
		const cache = createApiKeyCredentialCache(new MemoryRedis());
		const other: ApiKeyCredentialEntry = {
			userId: "user-2",
			organizationId: "org-2",
			apiKeyId: "key-2",
		};

		await cache.write("hash-a", sampleEntry);
		await cache.write("hash-b", other);

		await expect(cache.read("hash-a")).resolves.toEqual(sampleEntry);
		await expect(cache.read("hash-b")).resolves.toEqual(other);
		await cache.invalidate("hash-a");
		await expect(cache.read("hash-a")).resolves.toBeUndefined();
		await expect(cache.read("hash-b")).resolves.toEqual(other);
	});

	test("invalidateByApiKeyId clears credential via reverse index", async () => {
		const cache = createApiKeyCredentialCache(new MemoryRedis());
		await cache.write("deadbeef", sampleEntry);
		await cache.invalidateByApiKeyId("key-1");
		await expect(cache.read("deadbeef")).resolves.toBeUndefined();
	});

	test("invalidateByApiKeyId is no-op success when never written", async () => {
		const cache = createApiKeyCredentialCache(new MemoryRedis());
		await expect(cache.invalidateByApiKeyId("missing-id")).resolves.toBeUndefined();
	});
});
