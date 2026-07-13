export function sessionTokenCacheKey(sessionToken: string): string {
	return `session:token:${sessionToken}`;
}

export function sessionUserIndexKey(userId: string): string {
	return `session:user:${userId}`;
}

/**
 * Pull the session token from a Cookie header.
 * Better Auth uses cookiePrefix `reloop` → `reloop.session_token`.
 * On HTTPS it sets the Secure flag, which browsers/libs name as
 * `__Secure-reloop.session_token` (and occasionally `__Host-…`).
 */
export function extractSessionToken(cookie: string | null): string | null {
	if (!cookie) return null;
	const match = cookie.match(
		/(?:^|;\s*)(?:__Secure-|__Host-)?reloop\.session_token=([^;]+)/,
	);
	if (!match?.[1]) return null;
	const raw = decodeURIComponent(match[1]);
	// Cookie value is `token.signature` — cache keys use the bare token.
	const token = raw.split(".")[0];
	return token || null;
}
