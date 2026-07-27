import { describe, expect, test } from "bun:test";
import { createApiKeyCredential } from "@reloop/api-key/credential/api-key-credential";
import { generateApiKey, hashApiKey } from "@reloop/auth/apikey";
import {
	type ApiKeyCredentialEntry,
	createApiKeyCredentialCache,
} from "@reloop/auth/apikey/credential-cache";
import { validateApiKey } from "@reloop/auth/apikey/validate";
import { BusEvent } from "@reloop/bus";

type FakeRow = {
	id: string;
	organizationId: string;
	userId: string;
	key: string;
	enabled: boolean;
	name: string | null;
	start: string | null;
	prefix: string | null;
	refillInterval: null;
	refillAmount: null;
	lastRefillAt: null;
	rateLimitEnabled: boolean;
	rateLimitTimeWindow: number;
	rateLimitMax: number;
	requestCount: number;
	remaining: null;
	lastRequest: null;
	expiresAt: null;
	createdAt: Date;
	updatedAt: Date;
	permissions: null;
	metadata: null;
	user: {
		id: string;
		name: string;
		image: null;
		email: string;
	};
};

/**
 * Minimal db stand-in for disable/delete mutator paths.
 * Not a full drizzle mock — only methods the mutator uses.
 */
type UpdateValues = {
	enabled?: boolean;
	updatedAt?: Date;
	key?: string;
	start?: string | null;
	name?: string | null;
};

function createFakeDb(initial: FakeRow | null) {
	let row: FakeRow | null = initial ? { ...initial } : null;

	function applyUpdate(values: UpdateValues) {
		if (!row) return Promise.resolve([]);
		row = {
			...row,
			...values,
			enabled: values.enabled ?? row.enabled,
			key: values.key ?? row.key,
			name: values.name !== undefined ? values.name : row.name,
			start: values.start !== undefined ? values.start : row.start,
			updatedAt: values.updatedAt ?? row.updatedAt,
		};
		return Promise.resolve([{ ...row }]);
	}

	const updateChain = {
		set(values: UpdateValues) {
			return {
				where() {
					return {
						returning() {
							return applyUpdate(values);
						},
					};
				},
			};
		},
	};

	const tx = {
		select() {
			return {
				from() {
					return {
						where() {
							return {
								for() {
									return Promise.resolve(row ? [{ ...row }] : []);
								},
							};
						},
					};
				},
			};
		},
		update() {
			return updateChain;
		},
		delete() {
			return {
				where() {
					return {
						returning() {
							if (!row) return Promise.resolve([]);
							const id = row.id;
							row = null;
							return Promise.resolve([{ id }]);
						},
					};
				},
			};
		},
	};

	const db = {
		async transaction<T>(fn: (tx: typeof tx) => Promise<T>): Promise<T> {
			return fn(tx);
		},
		query: {
			apikey: {
				findFirst: async () =>
					row
						? {
								...row,
								user: row.user,
							}
						: undefined,
			},
		},
		update() {
			return updateChain;
		},
		insert() {
			return {
				values(values: Record<string, unknown>) {
					return {
						returning() {
							const now = new Date();
							const user = {
								id: String(values.userId ?? "user-1"),
								name: "Test",
								image: null as null,
								email: "t@example.com",
							};
							row = {
								id: String(values.id),
								organizationId: String(values.organizationId),
								userId: String(values.userId),
								key: String(values.key),
								enabled: Boolean(values.enabled ?? true),
								name: (values.name as string | null) ?? null,
								start: (values.start as string | null) ?? null,
								prefix: (values.prefix as string | null) ?? null,
								refillInterval: null,
								refillAmount: null,
								lastRefillAt: null,
								rateLimitEnabled: Boolean(values.rateLimitEnabled ?? true),
								rateLimitTimeWindow: Number(values.rateLimitTimeWindow ?? 1000),
								rateLimitMax: Number(values.rateLimitMax ?? 100),
								requestCount: Number(values.requestCount ?? 0),
								remaining: (values.remaining as number | null) ?? null,
								lastRequest: null,
								expiresAt: null,
								createdAt: (values.createdAt as Date) ?? now,
								updatedAt: (values.updatedAt as Date) ?? now,
								permissions: (values.permissions as string | null) ?? null,
								metadata: (values.metadata as string | null) ?? null,
								user,
							};
							return Promise.resolve([{ ...row }]);
						},
					};
				},
			};
		},
	};

	return {
		db: db as never,
		getRow: () => row,
	};
}

function sampleRow(hashed: string, overrides: Partial<FakeRow> = {}): FakeRow {
	const now = new Date();
	return {
		id: "key-1",
		organizationId: "org-1",
		userId: "user-1",
		key: hashed,
		enabled: true,
		name: "test",
		start: null,
		prefix: null,
		refillInterval: null,
		refillAmount: null,
		lastRefillAt: null,
		rateLimitEnabled: true,
		rateLimitTimeWindow: 1000,
		rateLimitMax: 100,
		requestCount: 0,
		remaining: null,
		lastRequest: null,
		expiresAt: null,
		createdAt: now,
		updatedAt: now,
		permissions: null,
		metadata: null,
		user: {
			id: "user-1",
			name: "Test",
			image: null,
			email: "t@example.com",
		},
		...overrides,
	};
}

function stubValidateDb() {
	return {
		query: {
			apikey: {
				findFirst: async () => null,
			},
		},
		update: () => ({
			set: () => ({
				where: () => ({
					catch: () => {},
				}),
			}),
		}),
	} as never;
}

function memoryStore() {
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
		has(key: string) {
			return map.has(key);
		},
	};
}

describe("ApiKeyCredential.disable", () => {
	test("after disable, previously cached secret fails validateApiKey", async () => {
		const raw = generateApiKey();
		const hashed = hashApiKey(raw);
		const entry: ApiKeyCredentialEntry = {
			userId: "user-1",
			organizationId: "org-1",
			apiKeyId: "key-1",
		};

		const store = memoryStore();
		const credentialCache = createApiKeyCredentialCache(store);
		await credentialCache.write(hashed, entry);

		// Cache hit path would auth before disable
		const before = await validateApiKey(raw, store, {
			query: {
				apikey: {
					findFirst: async () => null,
				},
			},
			update: () => ({
				set: () => ({
					where: () => ({
						catch: () => {},
					}),
				}),
			}),
		} as never);
		expect(before).toEqual({
			...entry,
			authType: "apikey",
		});

		const now = new Date();
		const { db } = createFakeDb({
			id: "key-1",
			organizationId: "org-1",
			userId: "user-1",
			key: hashed,
			enabled: true,
			name: "test",
			start: raw.slice(0, 17),
			prefix: "rl_prod",
			refillInterval: null,
			refillAmount: null,
			lastRefillAt: null,
			rateLimitEnabled: true,
			rateLimitTimeWindow: 1000,
			rateLimitMax: 100,
			requestCount: 0,
			remaining: null,
			lastRequest: null,
			expiresAt: null,
			createdAt: now,
			updatedAt: now,
			permissions: null,
			metadata: null,
			user: {
				id: "user-1",
				name: "Test",
				image: null,
				email: "t@example.com",
			},
		});

		const publishes: unknown[] = [];
		const credential = createApiKeyCredential({
			db,
			credentialCache,
			bus: {
				publish: async (event, payload) => {
					publishes.push({ event, payload });
				},
			},
		});

		const result = await credential.disable({
			id: "key-1",
			organizationId: "org-1",
		});

		expect(result.alreadyDisabled).toBe(false);
		expect(result.row.enabled).toBe(false);
		expect(publishes).toEqual([
			{
				event: BusEvent.API_KEY_DISABLED,
				payload: { api_key_id: "key-1", organizationId: "org-1" },
			},
		]);

		// Cache cleared; DB path returns no enabled row → null
		const after = await validateApiKey(raw, store, {
			query: {
				apikey: {
					findFirst: async () => null,
				},
			},
			update: () => ({
				set: () => ({
					where: () => ({
						catch: () => {},
					}),
				}),
			}),
		} as never);
		expect(after).toBeNull();
	});

	test("invalidate failure fails the operation after DB disable", async () => {
		const raw = generateApiKey();
		const hashed = hashApiKey(raw);
		const now = new Date();
		const { db } = createFakeDb({
			id: "key-1",
			organizationId: "org-1",
			userId: "user-1",
			key: hashed,
			enabled: true,
			name: "test",
			start: null,
			prefix: null,
			refillInterval: null,
			refillAmount: null,
			lastRefillAt: null,
			rateLimitEnabled: true,
			rateLimitTimeWindow: 1000,
			rateLimitMax: 100,
			requestCount: 0,
			remaining: null,
			lastRequest: null,
			expiresAt: null,
			createdAt: now,
			updatedAt: now,
			permissions: null,
			metadata: null,
			user: {
				id: "user-1",
				name: "Test",
				image: null,
				email: "t@example.com",
			},
		});

		const credential = createApiKeyCredential({
			db,
			credentialCache: {
				read: async () => undefined,
				write: async () => {},
				invalidate: async () => {
					throw new Error("redis down");
				},
			},
			bus: {
				publish: async () => {
					throw new Error("should not publish");
				},
			},
		});

		await expect(
			credential.disable({ id: "key-1", organizationId: "org-1" }),
		).rejects.toMatchObject({
			message: "Failed to revoke API key credential cache",
		});
	});

	test("missing creator after commit still returns successful disable (no 404)", async () => {
		const hashed = hashApiKey(generateApiKey());
		const store = memoryStore();
		const credentialCache = createApiKeyCredentialCache(store);
		const now = new Date();
		const { db, getRow } = createFakeDb({
			id: "key-1",
			organizationId: "org-1",
			userId: "user-1",
			key: hashed,
			enabled: true,
			name: "test",
			start: null,
			prefix: null,
			refillInterval: null,
			refillAmount: null,
			lastRefillAt: null,
			rateLimitEnabled: true,
			rateLimitTimeWindow: 1000,
			rateLimitMax: 100,
			requestCount: 0,
			remaining: null,
			lastRequest: null,
			expiresAt: null,
			createdAt: now,
			updatedAt: now,
			permissions: null,
			metadata: null,
			user: {
				id: "user-1",
				name: "Test",
				image: null,
				email: "t@example.com",
			},
		});

		// Simulate missing user relation on post-commit reload
		(db as { query: { apikey: { findFirst: () => Promise<unknown> } } }).query =
			{
				apikey: {
					findFirst: async () => ({
						...getRow(),
						user: null,
					}),
				},
			};

		const credential = createApiKeyCredential({
			db,
			credentialCache,
			bus: { publish: async () => {} },
		});

		const result = await credential.disable({
			id: "key-1",
			organizationId: "org-1",
		});
		expect(result.row.enabled).toBe(false);
		expect(result.row.user).toBeNull();
	});

	test("bus failure after successful invalidate still succeeds", async () => {
		const hashed = hashApiKey(generateApiKey());
		const store = memoryStore();
		const credentialCache = createApiKeyCredentialCache(store);
		const now = new Date();
		const { db } = createFakeDb({
			id: "key-1",
			organizationId: "org-1",
			userId: "user-1",
			key: hashed,
			enabled: true,
			name: "test",
			start: null,
			prefix: null,
			refillInterval: null,
			refillAmount: null,
			lastRefillAt: null,
			rateLimitEnabled: true,
			rateLimitTimeWindow: 1000,
			rateLimitMax: 100,
			requestCount: 0,
			remaining: null,
			lastRequest: null,
			expiresAt: null,
			createdAt: now,
			updatedAt: now,
			permissions: null,
			metadata: null,
			user: {
				id: "user-1",
				name: "Test",
				image: null,
				email: "t@example.com",
			},
		});

		const credential = createApiKeyCredential({
			db,
			credentialCache,
			bus: {
				publish: async () => {
					throw new Error("nats down");
				},
			},
		});

		const result = await credential.disable({
			id: "key-1",
			organizationId: "org-1",
		});
		expect(result.row.enabled).toBe(false);
	});
});

describe("ApiKeyCredential.disable — greptile follow-ups", () => {
	test("already-disabled retry still invalidates credential cache", async () => {
		const raw = generateApiKey();
		const hashed = hashApiKey(raw);
		const store = memoryStore();
		const credentialCache = createApiKeyCredentialCache(store);
		await credentialCache.write(hashed, {
			userId: "user-1",
			organizationId: "org-1",
			apiKeyId: "key-1",
		});

		const { db } = createFakeDb(sampleRow(hashed, { enabled: false }));
		const credential = createApiKeyCredential({
			db,
			credentialCache,
			bus: { publish: async () => {} },
		});

		const result = await credential.disable({
			id: "key-1",
			organizationId: "org-1",
		});
		expect(result.alreadyDisabled).toBe(true);

		const after = await validateApiKey(raw, store, stubValidateDb());
		expect(after).toBeNull();
	});
});

describe("ApiKeyCredential.delete", () => {
	test("after delete, previously cached secret fails validateApiKey", async () => {
		const raw = generateApiKey();
		const hashed = hashApiKey(raw);
		const entry: ApiKeyCredentialEntry = {
			userId: "user-1",
			organizationId: "org-1",
			apiKeyId: "key-1",
		};

		const store = memoryStore();
		const credentialCache = createApiKeyCredentialCache(store);
		await credentialCache.write(hashed, entry);

		const before = await validateApiKey(raw, store, stubValidateDb());
		expect(before?.authType).toBe("apikey");

		const publishes: unknown[] = [];
		const { db } = createFakeDb(sampleRow(hashed));
		const credential = createApiKeyCredential({
			db,
			credentialCache,
			bus: {
				publish: async (event, payload) => {
					publishes.push({ event, payload });
				},
			},
		});

		const result = await credential.delete({
			id: "key-1",
			organizationId: "org-1",
		});
		expect(result).toEqual({ id: "key-1" });
		expect(publishes).toEqual([
			{
				event: BusEvent.API_KEY_DELETED,
				payload: { api_key_id: "key-1", organizationId: "org-1" },
			},
		]);

		const after = await validateApiKey(raw, store, stubValidateDb());
		expect(after).toBeNull();
	});

	test("invalidate failure fails the operation after DB delete", async () => {
		const hashed = hashApiKey(generateApiKey());
		const { db } = createFakeDb(sampleRow(hashed));
		const credential = createApiKeyCredential({
			db,
			credentialCache: {
				read: async () => undefined,
				write: async () => {},
				invalidate: async () => {
					throw new Error("redis down");
				},
			},
			bus: {
				publish: async () => {
					throw new Error("should not publish");
				},
			},
		});

		await expect(
			credential.delete({ id: "key-1", organizationId: "org-1" }),
		).rejects.toMatchObject({
			message: "Failed to revoke API key credential cache",
		});
	});

	test("bus failure after successful invalidate still succeeds", async () => {
		const hashed = hashApiKey(generateApiKey());
		const store = memoryStore();
		const credentialCache = createApiKeyCredentialCache(store);
		const { db } = createFakeDb(sampleRow(hashed));
		const credential = createApiKeyCredential({
			db,
			credentialCache,
			bus: {
				publish: async () => {
					throw new Error("nats down");
				},
			},
		});

		await expect(
			credential.delete({ id: "key-1", organizationId: "org-1" }),
		).resolves.toEqual({ id: "key-1" });
	});

	test("retry after row gone still clears cache via id index (idempotent delete)", async () => {
		const raw = generateApiKey();
		const hashed = hashApiKey(raw);
		const store = memoryStore();
		const credentialCache = createApiKeyCredentialCache(store);
		await credentialCache.write(hashed, {
			userId: "user-1",
			organizationId: "org-1",
			apiKeyId: "key-1",
		});

		// Row already deleted — empty fake db
		const emptyDb = {
			async transaction<T>(
				fn: (tx: {
					select: () => {
						from: () => {
							where: () => { for: () => Promise<unknown[]> };
						};
					};
				}) => Promise<T>,
			): Promise<T> {
				const tx = {
					select() {
						return {
							from() {
								return {
									where() {
										return {
											for() {
												return Promise.resolve([]);
											},
										};
									},
								};
							},
						};
					},
				};
				return fn(tx);
			},
			query: { apikey: { findFirst: async () => undefined } },
		};

		const credential = createApiKeyCredential({
			db: emptyDb as never,
			credentialCache,
			bus: { publish: async () => {} },
		});

		await expect(
			credential.delete({ id: "key-1", organizationId: "org-1" }),
		).resolves.toEqual({ id: "key-1" });

		const after = await validateApiKey(raw, store, stubValidateDb());
		expect(after).toBeNull();
	});
});

describe("ApiKeyCredential.rotate", () => {
	test("after rotate, previously cached old secret fails validateApiKey", async () => {
		const oldRaw = generateApiKey();
		const oldHashed = hashApiKey(oldRaw);
		const entry: ApiKeyCredentialEntry = {
			userId: "user-1",
			organizationId: "org-1",
			apiKeyId: "key-1",
		};

		const store = memoryStore();
		const credentialCache = createApiKeyCredentialCache(store);
		await credentialCache.write(oldHashed, entry);

		const before = await validateApiKey(oldRaw, store, stubValidateDb());
		expect(before).toEqual({
			...entry,
			authType: "apikey",
		});

		const publishes: unknown[] = [];
		const { db, getRow } = createFakeDb(sampleRow(oldHashed));
		const credential = createApiKeyCredential({
			db,
			credentialCache,
			bus: {
				publish: async (event, payload) => {
					publishes.push({ event, payload });
				},
			},
		});

		const result = await credential.rotate({
			id: "key-1",
			organizationId: "org-1",
		});

		expect(result.plaintextKey).toMatch(/^rl_prod_/);
		expect(result.plaintextKey).not.toBe(oldRaw);
		expect(result.row.key).toBe(hashApiKey(result.plaintextKey));
		expect(result.row.key).not.toBe(oldHashed);
		expect(getRow()?.key).toBe(result.row.key);
		expect(publishes).toEqual([
			{
				event: BusEvent.API_KEY_ROTATED,
				payload: { api_key_id: "key-1", organizationId: "org-1" },
			},
		]);

		// Old secret must not authenticate via residual cache
		const afterOld = await validateApiKey(oldRaw, store, stubValidateDb());
		expect(afterOld).toBeNull();
	});

	test("new secret authenticates from DB after rotate (cache was not pre-warmed)", async () => {
		const oldRaw = generateApiKey();
		const oldHashed = hashApiKey(oldRaw);
		const store = memoryStore();
		const credentialCache = createApiKeyCredentialCache(store);
		const { db, getRow } = createFakeDb(sampleRow(oldHashed));

		const credential = createApiKeyCredential({
			db,
			credentialCache,
			bus: { publish: async () => {} },
		});

		const { plaintextKey } = await credential.rotate({
			id: "key-1",
			organizationId: "org-1",
		});

		const row = getRow();
		expect(row).not.toBeNull();

		const afterNew = await validateApiKey(plaintextKey, store, {
			query: {
				apikey: {
					findFirst: async () =>
						row
							? {
									id: row.id,
									userId: row.userId,
									organizationId: row.organizationId,
									key: row.key,
									enabled: row.enabled,
								}
							: undefined,
				},
			},
			update: () => ({
				set: () => ({
					where: () => ({
						catch: () => {},
					}),
				}),
			}),
		} as never);

		expect(afterNew).toEqual({
			userId: "user-1",
			organizationId: "org-1",
			apiKeyId: "key-1",
			authType: "apikey",
		});
	});

	test("invalidate failure fails the operation after DB rotate", async () => {
		const hashed = hashApiKey(generateApiKey());
		const { db, getRow } = createFakeDb(sampleRow(hashed));
		const credential = createApiKeyCredential({
			db,
			credentialCache: {
				read: async () => undefined,
				write: async () => {},
				invalidate: async () => {
					throw new Error("redis down");
				},
				invalidateByApiKeyId: async () => {},
			},
			bus: {
				publish: async () => {
					throw new Error("should not publish");
				},
			},
		});

		await expect(
			credential.rotate({ id: "key-1", organizationId: "org-1" }),
		).rejects.toMatchObject({
			message: "Failed to revoke API key credential cache",
		});

		// DB still advanced (new hash) — client must retry rotate to finish revoke
		expect(getRow()?.key).not.toBe(hashed);
	});

	test("bus failure after successful invalidate still succeeds", async () => {
		const hashed = hashApiKey(generateApiKey());
		const store = memoryStore();
		const credentialCache = createApiKeyCredentialCache(store);
		const { db } = createFakeDb(sampleRow(hashed));
		const credential = createApiKeyCredential({
			db,
			credentialCache,
			bus: {
				publish: async () => {
					throw new Error("nats down");
				},
			},
		});

		const result = await credential.rotate({
			id: "key-1",
			organizationId: "org-1",
		});
		expect(result.plaintextKey).toMatch(/^rl_prod_/);
		expect(result.row.key).not.toBe(hashed);
	});

	test("not found throws before cache or bus", async () => {
		const emptyDb = {
			async transaction<T>(
				fn: (tx: {
					select: () => {
						from: () => {
							where: () => { for: () => Promise<unknown[]> };
						};
					};
				}) => Promise<T>,
			): Promise<T> {
				const tx = {
					select() {
						return {
							from() {
								return {
									where() {
										return {
											for() {
												return Promise.resolve([]);
											},
										};
									},
								};
							},
						};
					},
				};
				return fn(tx);
			},
			query: { apikey: { findFirst: async () => undefined } },
		};

		const credential = createApiKeyCredential({
			db: emptyDb as never,
			credentialCache: {
				read: async () => undefined,
				write: async () => {},
				invalidate: async () => {
					throw new Error("should not invalidate");
				},
				invalidateByApiKeyId: async () => {
					throw new Error("should not invalidate by id");
				},
			},
			bus: {
				publish: async () => {
					throw new Error("should not publish");
				},
			},
		});

		await expect(
			credential.rotate({ id: "missing", organizationId: "org-1" }),
		).rejects.toMatchObject({
			message: "API key not found",
		});
	});

	test("retry after failed invalidate still clears old secret via reverse index", async () => {
		const oldRaw = generateApiKey();
		const oldHashed = hashApiKey(oldRaw);
		const store = memoryStore();
		const credentialCache = createApiKeyCredentialCache(store);
		await credentialCache.write(oldHashed, {
			userId: "user-1",
			organizationId: "org-1",
			apiKeyId: "key-1",
		});

		const { db, getRow } = createFakeDb(sampleRow(oldHashed));

		// First rotate: DB updates, primary invalidate throws (simulates partial failure
		// where reverse index may still map id → old hash).
		let invalidateCalls = 0;
		const flakyCache = {
			read: (hashedKey: string) => credentialCache.read(hashedKey),
			write: (hashedKey: string, entry: ApiKeyCredentialEntry, ttl?: number) =>
				credentialCache.write(hashedKey, entry, ttl),
			invalidate: async (hashedKey: string) => {
				invalidateCalls += 1;
				if (invalidateCalls === 1) {
					throw new Error("redis blip");
				}
				return credentialCache.invalidate(hashedKey);
			},
			invalidateByApiKeyId: (apiKeyId: string) =>
				credentialCache.invalidateByApiKeyId(apiKeyId),
		};

		const credential = createApiKeyCredential({
			db,
			credentialCache: flakyCache,
			bus: { publish: async () => {} },
		});

		await expect(
			credential.rotate({ id: "key-1", organizationId: "org-1" }),
		).rejects.toMatchObject({
			message: "Failed to revoke API key credential cache",
		});

		// Old secret still cached after failed first rotate
		const stillCached = await validateApiKey(oldRaw, store, stubValidateDb());
		expect(stillCached?.apiKeyId).toBe("key-1");

		// Retry: new DB hash + invalidateByApiKeyId must clear residual old entry
		const retry = await credential.rotate({
			id: "key-1",
			organizationId: "org-1",
		});
		expect(retry.row.key).toBe(getRow()?.key);

		const afterRetry = await validateApiKey(oldRaw, store, stubValidateDb());
		expect(afterRetry).toBeNull();
	});
});

describe("ApiKeyCredential.create", () => {
	test("returns plaintext once and stores only the hash", async () => {
		const store = memoryStore();
		const credentialCache = createApiKeyCredentialCache(store);
		const publishes: unknown[] = [];
		const { db, getRow } = createFakeDb(null);

		const credential = createApiKeyCredential({
			db,
			credentialCache,
			bus: {
				publish: async (event, payload) => {
					publishes.push({ event, payload });
				},
			},
		});

		const result = await credential.create({
			organizationId: "org-1",
			userId: "user-1",
			name: "Production",
		});

		expect(result.plaintextKey).toMatch(/^rl_prod_/);
		expect(result.row.key).toBe(hashApiKey(result.plaintextKey));
		expect(result.row.key).not.toBe(result.plaintextKey);
		expect(result.row.name).toBe("Production");
		expect(result.row.enabled).toBe(true);
		expect(result.row.id).toMatch(/^api_key_/);
		expect(getRow()?.key).toBe(result.row.key);
		expect(publishes).toEqual([
			{
				event: BusEvent.API_KEY_CREATED,
				payload: {
					api_key_id: result.row.id,
					organizationId: "org-1",
				},
			},
		]);
	});

	test("bus failure after successful insert still succeeds", async () => {
		const store = memoryStore();
		const credentialCache = createApiKeyCredentialCache(store);
		const { db } = createFakeDb(null);

		const credential = createApiKeyCredential({
			db,
			credentialCache,
			bus: {
				publish: async () => {
					throw new Error("nats down");
				},
			},
		});

		const result = await credential.create({
			organizationId: "org-1",
			userId: "user-1",
			name: "Still ok",
		});
		expect(result.plaintextKey).toMatch(/^rl_prod_/);
		expect(result.row.name).toBe("Still ok");
	});
});

describe("ApiKeyCredential.enable", () => {
	test("enables a disabled key and publishes once", async () => {
		const hashed = hashApiKey(generateApiKey());
		const store = memoryStore();
		const credentialCache = createApiKeyCredentialCache(store);
		const publishes: unknown[] = [];
		const { db } = createFakeDb(sampleRow(hashed, { enabled: false }));

		const credential = createApiKeyCredential({
			db,
			credentialCache,
			bus: {
				publish: async (event, payload) => {
					publishes.push({ event, payload });
				},
			},
		});

		const result = await credential.enable({
			id: "key-1",
			organizationId: "org-1",
		});

		expect(result.alreadyEnabled).toBe(false);
		expect(result.row.enabled).toBe(true);
		expect(publishes).toEqual([
			{
				event: BusEvent.API_KEY_ENABLED,
				payload: { api_key_id: "key-1", organizationId: "org-1" },
			},
		]);
	});

	test("already-enabled is idempotent and skips bus", async () => {
		const hashed = hashApiKey(generateApiKey());
		const store = memoryStore();
		const credentialCache = createApiKeyCredentialCache(store);
		const publishes: unknown[] = [];
		const { db } = createFakeDb(sampleRow(hashed, { enabled: true }));

		const credential = createApiKeyCredential({
			db,
			credentialCache,
			bus: {
				publish: async (event, payload) => {
					publishes.push({ event, payload });
				},
			},
		});

		const result = await credential.enable({
			id: "key-1",
			organizationId: "org-1",
		});

		expect(result.alreadyEnabled).toBe(true);
		expect(result.row.enabled).toBe(true);
		expect(publishes).toEqual([]);
	});

	test("missing key throws notFound", async () => {
		const store = memoryStore();
		const credentialCache = createApiKeyCredentialCache(store);
		const { db } = createFakeDb(null);

		const credential = createApiKeyCredential({
			db,
			credentialCache,
			bus: { publish: async () => {} },
		});

		await expect(
			credential.enable({ id: "missing", organizationId: "org-1" }),
		).rejects.toMatchObject({
			message: "API key not found",
		});
	});

	test("bus failure after successful enable still succeeds", async () => {
		const hashed = hashApiKey(generateApiKey());
		const store = memoryStore();
		const credentialCache = createApiKeyCredentialCache(store);
		const { db } = createFakeDb(sampleRow(hashed, { enabled: false }));

		const credential = createApiKeyCredential({
			db,
			credentialCache,
			bus: {
				publish: async () => {
					throw new Error("nats down");
				},
			},
		});

		const result = await credential.enable({
			id: "key-1",
			organizationId: "org-1",
		});
		expect(result.row.enabled).toBe(true);
		expect(result.alreadyEnabled).toBe(false);
	});
});

describe("ApiKeyCredential.update", () => {
	test("renames the key and publishes", async () => {
		const hashed = hashApiKey(generateApiKey());
		const store = memoryStore();
		const credentialCache = createApiKeyCredentialCache(store);
		const publishes: unknown[] = [];
		const { db, getRow } = createFakeDb(sampleRow(hashed, { name: "Old" }));

		const credential = createApiKeyCredential({
			db,
			credentialCache,
			bus: {
				publish: async (event, payload) => {
					publishes.push({ event, payload });
				},
			},
		});

		const result = await credential.update({
			id: "key-1",
			organizationId: "org-1",
			name: "New name",
		});

		expect(result.row.name).toBe("New name");
		expect(getRow()?.name).toBe("New name");
		// Secret material untouched
		expect(getRow()?.key).toBe(hashed);
		expect(publishes).toEqual([
			{
				event: BusEvent.API_KEY_UPDATED,
				payload: { api_key_id: "key-1", organizationId: "org-1" },
			},
		]);
	});

	test("missing key throws notFound", async () => {
		const store = memoryStore();
		const credentialCache = createApiKeyCredentialCache(store);
		const { db } = createFakeDb(null);

		const credential = createApiKeyCredential({
			db,
			credentialCache,
			bus: { publish: async () => {} },
		});

		await expect(
			credential.update({
				id: "missing",
				organizationId: "org-1",
				name: "Nope",
			}),
		).rejects.toMatchObject({
			message: "API key not found",
		});
	});

	test("bus failure after successful update still succeeds", async () => {
		const hashed = hashApiKey(generateApiKey());
		const store = memoryStore();
		const credentialCache = createApiKeyCredentialCache(store);
		const { db } = createFakeDb(sampleRow(hashed, { name: "Old" }));

		const credential = createApiKeyCredential({
			db,
			credentialCache,
			bus: {
				publish: async () => {
					throw new Error("nats down");
				},
			},
		});

		const result = await credential.update({
			id: "key-1",
			organizationId: "org-1",
			name: "Still renamed",
		});
		expect(result.row.name).toBe("Still renamed");
	});
});
