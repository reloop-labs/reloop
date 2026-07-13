import { evictAllSessionsForUser } from "./evict-all-sessions-for-user";
import { evictSessionByToken } from "./evict-session-by-token";
import type { SessionEvictionEvent } from "./session-eviction-event";
import type { AuthRedis } from "./types";

/**
 * Apply one eviction event against the shared session-validation cache.
 *
 * - logout → delete that session-token entry (+ prune user index if userId known)
 * - password-change / organization-switch → delete every token in the user index
 */
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
