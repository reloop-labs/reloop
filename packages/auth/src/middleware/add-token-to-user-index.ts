import { sessionUserIndexKey } from "./session-user-index-key";
import type { AuthRedis } from "./types";

/** Track a session token under the per-user index for bulk eviction. */
export async function addTokenToUserIndex(
	redis: AuthRedis,
	userId: string,
	token: string,
	ttl: number,
): Promise<void> {
	const indexKey = sessionUserIndexKey(userId);
	const existing = (await redis.get<string[]>(indexKey)) ?? [];
	if (existing.includes(token)) {
		await redis.set(indexKey, existing, ttl);
		return;
	}
	await redis.set(indexKey, [...existing, token], ttl);
}
