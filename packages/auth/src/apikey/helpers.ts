import { createHash, randomBytes } from "node:crypto";

/**
 * Dependency-light API-key helpers (no Elysia, Redis, or DB).
 * Used by the api-key service and absorbed into `@reloop/auth/apikey`.
 */

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

export function getApiKeyCacheKey(apiKey: string): string {
	return `apikey:v1:${apiKey}`;
}
