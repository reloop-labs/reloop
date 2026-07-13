import {
	extractSessionToken,
	sessionTokenCacheKey,
	sessionUserIndexKey,
} from "./keys";
import type { AuthContext, AuthRedis } from "./types";

type SessionUser = {
	id: string;
	role?: string | null;
	activeOrganizationId?: string | null;
};

type GetSessionBody = {
	user?: SessionUser | null;
} | null;

export type ResolveSessionOptions = {
	baseUrl: string;
	redis: AuthRedis;
	ttl: number;
	/** When true, require activeOrganizationId (fail closed). */
	requireOrg: boolean;
};

/**
 * Resolve a session cookie to AuthContext via cache or get-session HTTP.
 * Always checks response.ok before trusting the body.
 */
export async function resolveSession(
	cookie: string | null,
	opts: ResolveSessionOptions,
): Promise<AuthContext | null> {
	if (!cookie) return null;

	const token = extractSessionToken(cookie);
	if (!token) return null;

	const cacheKey = sessionTokenCacheKey(token);
	const cached = await opts.redis.get<AuthContext>(cacheKey);
	if (cached) {
		if (opts.requireOrg && !cached.organizationId) return null;
		return cached;
	}

	const sessionUrl = `${opts.baseUrl.replace(/\/$/, "")}/api/auth/v1/get-session`;
	let response: Response;
	try {
		response = await fetch(sessionUrl, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Cookie: cookie,
			},
		});
	} catch {
		return null;
	}

	// Always check HTTP status before trusting the body.
	if (!response.ok) return null;

	let body: GetSessionBody;
	try {
		body = (await response.json()) as GetSessionBody;
	} catch {
		return null;
	}

	const user = body?.user;
	if (!user?.id) return null;

	const organizationId = user.activeOrganizationId ?? null;
	if (opts.requireOrg && !organizationId) return null;

	const ctx: AuthContext = {
		userId: user.id,
		organizationId,
		role: user.role ?? null,
		authType: "session",
	};

	// Cache + per-user index (best-effort; never block auth on cache failure).
	await opts.redis.set(cacheKey, ctx, opts.ttl).catch(() => undefined);
	await addTokenToUserIndex(opts.redis, user.id, token, opts.ttl).catch(
		() => undefined,
	);

	return ctx;
}

async function addTokenToUserIndex(
	redis: AuthRedis,
	userId: string,
	token: string,
	ttl: number,
): Promise<void> {
	const indexKey = sessionUserIndexKey(userId);
	const existing = (await redis.get<string[]>(indexKey)) ?? [];
	if (existing.includes(token)) {
		// Refresh TTL on the index entry.
		await redis.set(indexKey, existing, ttl);
		return;
	}
	await redis.set(indexKey, [...existing, token], ttl);
}
