export function extractApiKey(headers: Headers): string | null {
	const raw =
		headers.get("x-api-key") ||
		headers.get("authorization")?.replace(/^Bearer\s+/i, "");
	return raw || null;
}
