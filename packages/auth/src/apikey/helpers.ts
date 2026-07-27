import { createHash, randomBytes } from "node:crypto";
import { apiKeyCredentialCacheKey } from "@reloop/auth/apikey/credential-cache";

export const API_KEY_PREFIX = "rl_prod";
export const API_KEY_LENGTH = 20;

/**
 * Hard upper bound for API key header values.
 * Legitimate keys are ~35 chars (`rl_prod_` + base64url of 20 bytes).
 * Reject larger values before hashing to stop header-size CPU DoS.
 */
export const API_KEY_MAX_LENGTH = 128;

/**
 * Soft lower bound: prefix + underscore + minimum secret material.
 * Slightly below a normal generated key so format tests stay flexible.
 */
export const API_KEY_MIN_LENGTH = API_KEY_PREFIX.length + 1 + 16;

const API_KEY_CHARSET = /^[a-zA-Z0-9_-]+$/;

/**
 * Cheap shape gate before any crypto or I/O.
 * Does not prove the key exists — only that it is safe to hash/look up.
 */
export function isPlausibleApiKeyShape(key: string): boolean {
	if (key.length < API_KEY_MIN_LENGTH || key.length > API_KEY_MAX_LENGTH) {
		return false;
	}
	if (!key.includes("_")) return false;
	return API_KEY_CHARSET.test(key);
}

export function hashApiKey(key: string): string {
	return createHash("sha256").update(key).digest("hex");
}

export function generateApiKey(): string {
	const randomPart = randomBytes(API_KEY_LENGTH).toString("base64url");
	return `${API_KEY_PREFIX}_${randomPart}`;
}

export function getKeyStart(key: string): string {
	return key.substring(0, 17);
}

/**
 * Redis key for a hashed API Key secret.
 * Delegates to `apiKeyCredentialCacheKey` so the formula stays single-sourced.
 */
export function getApiKeyCacheKey(hashedKey: string): string {
	return apiKeyCredentialCacheKey(hashedKey);
}
