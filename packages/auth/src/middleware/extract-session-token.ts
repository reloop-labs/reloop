/**
 * Extract the Better Auth session token from a Cookie header.
 * Cookie name uses the `reloop` cookiePrefix: `reloop.session_token`.
 */
export function extractSessionToken(cookie: string | null): string | null {
	if (!cookie) return null;
	const match = cookie.match(/(?:^|;\s*)reloop\.session_token=([^;]+)/);
	if (!match?.[1]) return null;
	const raw = decodeURIComponent(match[1]);
	// Better Auth stores `token.signature` in the cookie value.
	const token = raw.split(".")[0];
	return token || null;
}
