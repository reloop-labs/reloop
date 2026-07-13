import type { AuthRedis } from "../types";
import { sessionTokenCacheKey, sessionUserIndexKey } from "../keys";

export async function evictSessionByToken(
	redis: AuthRedis,
	sessionToken: string,
	userId?: string | null,
): Promise<void> {
	await redis.delete(sessionTokenCacheKey(sessionToken));

	if (!userId) return;

	const indexKey = sessionUserIndexKey(userId);
	const tokens = (await redis.get<string[]>(indexKey)) ?? [];
	const next = tokens.filter((t) => t !== sessionToken);
	if (next.length === 0) {
		await redis.delete(indexKey);
	} else {
		await redis.set(indexKey, next);
	}
}
