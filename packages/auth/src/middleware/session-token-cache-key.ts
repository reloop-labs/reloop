/** Validated session context, keyed by the raw session token (not full cookie). */
export function sessionTokenCacheKey(sessionToken: string): string {
	return `session:token:${sessionToken}`;
}
