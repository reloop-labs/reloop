import type { AuthRedis } from "../types";
import { sessionTokenCacheKey, sessionUserIndexKey } from "../keys";

export async function evictAllSessionsForUser(
	redis: AuthRedis,
	userId: string,
): Promise<void> {
	const indexKey = sessionUserIndexKey(userId);
	const tokens = (await redis.get<string[]>(indexKey)) ?? [];
	for (const token of tokens) {
		await redis.delete(sessionTokenCacheKey(token));
	}
	await redis.delete(indexKey);
}
