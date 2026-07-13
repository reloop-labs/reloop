export function sessionUserIndexKey(userId: string): string {
	return `session:user:${userId}`;
}
