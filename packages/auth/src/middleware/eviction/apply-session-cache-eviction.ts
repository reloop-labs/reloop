import type { AuthRedis } from "../types";
import { evictAllSessionsForUser } from "./evict-all-sessions-for-user";
import { evictSessionByToken } from "./evict-session-by-token";
import type { SessionEvictionEvent } from "./session-eviction-event";

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
