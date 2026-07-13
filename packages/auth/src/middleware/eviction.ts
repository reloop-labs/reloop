import {
	extractSessionToken,
	sessionTokenCacheKey,
	sessionUserIndexKey,
} from "./keys";
import type { AuthRedis } from "./types";

/**
 * Shared RedisCache prefix for the short-TTL session validation cache.
 * Every service that mounts `createAuthPlugin` must inject a Redis client
 * constructed with this prefix so central eviction hits the same keys.
 */
export const SESSION_CACHE_REDIS_PREFIX = "reloop-session";

/** Lifecycle events that require session-cache eviction. */
export type SessionEvictionEvent =
	| { type: "logout"; sessionToken: string; userId?: string | null }
	| { type: "password-change"; userId: string }
	| { type: "organization-switch"; userId: string };

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

/** Delete one cached session and optionally remove it from the user index. */
export async function evictSessionByToken(
	redis: AuthRedis,
	sessionToken: string,
	userId?: string | null,
): Promise<void> {
	await redis.delete(sessionTokenCacheKey(sessionToken));

	if (!userId) return;

	const indexKey = sessionUserIndexKey(userId);
	const tokens = (await redis.get<string[]>(indexKey)) ?? [];
	const next = tokens.filter((t) => t !== sessionToken);
	if (next.length === 0) {
		await redis.delete(indexKey);
	} else {
		await redis.set(indexKey, next);
	}
}

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

/**
 * Map a Better Auth request path (+ cookie / user) onto an eviction event.
 * Returns null when the path is not a lifecycle event we care about.
 */
export function evictionEventFromAuthPath(opts: {
	path: string;
	cookieHeader?: string | null;
	userId?: string | null;
}): SessionEvictionEvent | null {
	const path = opts.path;

	if (path === "/sign-out") {
		const token = extractSessionToken(opts.cookieHeader ?? null);
		if (!token) return null;
		return {
			type: "logout",
			sessionToken: token,
			userId: opts.userId ?? null,
		};
	}

	if (path === "/change-password" || path === "/reset-password") {
		if (!opts.userId) return null;
		return { type: "password-change", userId: opts.userId };
	}

	if (path === "/organization/set-active") {
		if (!opts.userId) return null;
		return { type: "organization-switch", userId: opts.userId };
	}

	return null;
}

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
