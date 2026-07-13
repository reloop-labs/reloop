import { describe, expect, test } from "bun:test";
import { generateApiKey, hashApiKey } from "@reloop/auth/apikey";
import { validateApiKey } from "@reloop/auth/apikey/validate";

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
					}),
				},
			},
			update: () => ({
				set: () => ({
					where: () => ({
						catch: () => {},
					}),
				}),
			}),
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
		const redis = {
			async get<T>(): Promise<T | undefined> {
				return undefined;
			},
			async set(): Promise<void> {},
			async delete(): Promise<void> {},
		};
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
