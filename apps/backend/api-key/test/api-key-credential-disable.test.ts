import { describe, expect, test } from "bun:test";
import { createApiKeyCredential } from "@reloop/api-key/credential/api-key-credential";
import {
	createApiKeyCredentialCache,
	type ApiKeyCredentialEntry,
} from "@reloop/auth/apikey/credential-cache";
import { generateApiKey, hashApiKey } from "@reloop/auth/apikey";
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
function createFakeDb(initial: FakeRow) {
	let row: FakeRow | null = { ...initial };

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
			return {
				set(values: { enabled?: boolean; updatedAt?: Date }) {
					return {
						where() {
							return {
								returning() {
									if (!row) return Promise.resolve([]);
									row = {
										...row,
										...values,
										enabled: values.enabled ?? row.enabled,
										updatedAt: values.updatedAt ?? row.updatedAt,
									};
									return Promise.resolve([{ ...row }]);
								},
							};
						},
					};
				},
			};
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

		const { db } = createFakeDb(
			sampleRow(hashed, { enabled: false }),
		);
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
