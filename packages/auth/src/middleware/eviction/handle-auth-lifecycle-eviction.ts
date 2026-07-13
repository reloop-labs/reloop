import type { AuthRedis } from "@reloop/auth/middleware/types";
import { applySessionCacheEviction } from "@reloop/auth/middleware/eviction/apply-session-cache-eviction";
import { evictionEventFromAuthPath } from "@reloop/auth/middleware/eviction/eviction-event-from-auth-path";
import type { SessionEvictionEvent } from "@reloop/auth/middleware/eviction/session-eviction-event";

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
