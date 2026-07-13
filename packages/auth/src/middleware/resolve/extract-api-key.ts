/**
 * Pull raw API key from x-api-key or Authorization Bearer.
 */
export function extractApiKey(headers: Headers): string | null {
	const raw =
		headers.get("x-api-key") ||
		headers.get("authorization")?.replace(/^Bearer\s+/i, "");
	return raw || null;
}
