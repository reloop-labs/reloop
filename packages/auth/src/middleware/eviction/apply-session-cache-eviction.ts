import type { AuthRedis } from "@reloop/auth/middleware/types";
import { evictAllSessionsForUser } from "@reloop/auth/middleware/eviction/evict-all-sessions-for-user";
import { evictSessionByToken } from "@reloop/auth/middleware/eviction/evict-session-by-token";
import type { SessionEvictionEvent } from "@reloop/auth/middleware/eviction/session-eviction-event";

export async function applySessionCacheEviction(
	redis: AuthRedis,
	event: SessionEvictionEvent,
): Promise<void> {
	if (event.type === "logout") {
		await evictSessionByToken(redis, event.sessionToken, event.userId);
		return;
	}
	await evictAllSessionsForUser(redis, event.userId);
}
