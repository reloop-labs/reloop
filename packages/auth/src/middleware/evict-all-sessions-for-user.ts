import { sessionTokenCacheKey } from "./session-token-cache-key";
import { sessionUserIndexKey } from "./session-user-index-key";
import type { AuthRedis } from "./types";

/** Read the per-user index and delete every session-token entry + the index. */
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
