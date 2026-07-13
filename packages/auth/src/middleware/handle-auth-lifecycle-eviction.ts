import { applySessionCacheEviction } from "./apply-session-cache-eviction";
import { evictionEventFromAuthPath } from "./eviction-event-from-auth-path";
import type { SessionEvictionEvent } from "./session-eviction-event";
import type { AuthRedis } from "./types";

/**
 * Best-effort hook entrypoint: resolve an event from the path and apply it.
 * Never throws — eviction must not break the auth response.
 */
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
	} catch {
		// ignore — auth path must succeed even if cache is down
	}
	return event;
}
