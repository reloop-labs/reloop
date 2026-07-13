/** Per-user index of cached session tokens (for bulk eviction). */
export function sessionUserIndexKey(userId: string): string {
	return `session:user:${userId}`;
}
