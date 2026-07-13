import { createHash, randomBytes } from "node:crypto";
import { apiKeyCredentialCacheKey } from "@reloop/auth/apikey/credential-cache";

export const API_KEY_PREFIX = "rl_prod";
export const API_KEY_LENGTH = 20;

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
