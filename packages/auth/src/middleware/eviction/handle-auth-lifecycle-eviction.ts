import type { AuthRedis } from "../types";
import { applySessionCacheEviction } from "./apply-session-cache-eviction";
import { evictionEventFromAuthPath } from "./eviction-event-from-auth-path";
import type { SessionEvictionEvent } from "./session-eviction-event";

export async function handleAuthLifecycleEviction(
	redis: AuthRedis,
	opts: {
		path: string;
		cookieHeader?: string | null;
		userId?: string | null;
	},
): Promise<SessionEvictionEvent | null> {
	const event = evictionEventFromAuthPath(opts);
	if (!event) return null;
	try {
		await applySessionCacheEviction(redis, event);
	} catch { }
	return event;
}
