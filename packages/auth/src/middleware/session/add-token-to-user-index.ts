import { sessionUserIndexKey } from "@reloop/auth/middleware/keys";
import type { AuthRedis } from "@reloop/auth/middleware/types";

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
