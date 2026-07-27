import { API_KEY_MAX_LENGTH } from "@reloop/auth/apikey/helpers";

/**
 * Extract a candidate API key from request headers.
 * Bounds length before any crypto; oversize values are treated as absent.
 */
export function extractApiKey(headers: Headers): string | null {
	const fromApiKey = headers.get("x-api-key");
	const fromAuth = headers.get("authorization");
	const raw =
		fromApiKey?.trim() || fromAuth?.replace(/^Bearer\s+/i, "").trim() || "";

	if (!raw) return null;
	// Reject before validate/hash — attacker-controlled megabyte headers.
	if (raw.length > API_KEY_MAX_LENGTH) return null;
	return raw;
}
