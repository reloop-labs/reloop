export function sessionTokenCacheKey(sessionToken: string): string {
	return `session:token:${sessionToken}`;
}
