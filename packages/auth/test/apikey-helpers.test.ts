import { describe, expect, test } from "bun:test";
import {
	API_KEY_LENGTH,
	API_KEY_PREFIX,
	generateApiKey,
	getApiKeyCacheKey,
	getKeyStart,
	hashApiKey,
} from "@reloop/auth/apikey/helpers";

describe("API key generation / hashing helpers", () => {
	test("generateApiKey uses the production prefix and a long enough secret", () => {
		const key = generateApiKey();
		expect(key.startsWith(`${API_KEY_PREFIX}_`)).toBe(true);
		const secret = key.slice(API_KEY_PREFIX.length + 1);
		// base64url of API_KEY_LENGTH random bytes is longer than the byte count
		expect(secret.length).toBeGreaterThanOrEqual(API_KEY_LENGTH);
		expect(key).toMatch(/^[a-zA-Z0-9_-]+$/);
	});

	test("generateApiKey produces unique keys", () => {
		const a = generateApiKey();
		const b = generateApiKey();
		expect(a).not.toBe(b);
	});

	test("hashApiKey is stable SHA-256 hex", () => {
		// Worked example: sha256("hello") known digest
		expect(hashApiKey("hello")).toBe(
			"2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
		);
		expect(hashApiKey("hello")).toBe(hashApiKey("hello"));
		expect(hashApiKey("hello")).not.toBe(hashApiKey("world"));
	});

	test("getKeyStart returns the first 17 characters", () => {
		const key = `${API_KEY_PREFIX}_abcdefghijklmnopqrstuvwxyz`;
		expect(getKeyStart(key)).toBe(key.slice(0, 17));
		expect(getKeyStart(key).length).toBe(17);
	});

	test("getApiKeyCacheKey namespaces under apikey:v1", () => {
		expect(getApiKeyCacheKey("abc")).toBe("apikey:v1:abc");
	});
});
