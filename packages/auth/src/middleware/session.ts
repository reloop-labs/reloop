import {
	extractSessionToken,
	sessionTokenCacheKey,
	sessionUserIndexKey,
} from "./keys";
import type { AuthContext, AuthContextWithProfile, AuthRedis } from "./types";

type SessionUser = {
	id: string;
	role?: string | null;
	email?: string | null;
	name?: string | null;
	image?: string | null;
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
 * Resolve a session cookie to lean AuthContext via cache or get-session HTTP.
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
		const lean = normalizeCachedContext(cached);
		if (!lean) return null;
		if (opts.requireOrg && !lean.organizationId) return null;
		return lean;
	}

	const fetched = await fetchGetSession(cookie, opts.baseUrl);
	if (!fetched) return null;

	const organizationId = fetched.activeOrganizationId;
	if (opts.requireOrg && !organizationId) return null;

	const ctx: AuthContext = {
		userId: fetched.id,
		organizationId,
		platformRole: fetched.role,
		authType: "session",
	};

	await opts.redis.set(cacheKey, ctx, opts.ttl).catch(() => undefined);
	await addTokenToUserIndex(opts.redis, fetched.id, token, opts.ttl).catch(
		() => undefined,
	);

	return ctx;
}

/**
 * Resolve session with profile fields via get-session.
 * Always fetches (profile is not cached). Writes lean AuthContext to the
 * session-validation cache so subsequent lean macros hit Redis.
 */
export async function resolveSessionWithProfile(
	cookie: string | null,
	opts: ResolveSessionOptions,
): Promise<AuthContextWithProfile | null> {
	if (!cookie) return null;

	const token = extractSessionToken(cookie);
	if (!token) return null;

	const fetched = await fetchGetSession(cookie, opts.baseUrl);
	if (!fetched) return null;

	const organizationId = fetched.activeOrganizationId;
	if (opts.requireOrg && !organizationId) return null;

	const ctx: AuthContext = {
		userId: fetched.id,
		organizationId,
		platformRole: fetched.role,
		authType: "session",
	};

	const cacheKey = sessionTokenCacheKey(token);
	await opts.redis.set(cacheKey, ctx, opts.ttl).catch(() => undefined);
	await addTokenToUserIndex(opts.redis, fetched.id, token, opts.ttl).catch(
		() => undefined,
	);

	return {
		...ctx,
		userEmail: fetched.email,
		userName: fetched.name,
		userImage: fetched.image,
	};
}

type FetchedUser = {
	id: string;
	role: string | null;
	email?: string;
	name?: string;
	image?: string;
	activeOrganizationId: string | null;
};

async function fetchGetSession(
	cookie: string,
	baseUrl: string,
): Promise<FetchedUser | null> {
	const sessionUrl = `${baseUrl.replace(/\/$/, "")}/api/auth/v1/get-session`;
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

	if (!response.ok) return null;

	let body: GetSessionBody;
	try {
		body = (await response.json()) as GetSessionBody;
	} catch {
		return null;
	}

	const user = body?.user;
	if (!user?.id) return null;

	return {
		id: user.id,
		role: user.role ?? null,
		email: user.email ?? undefined,
		name: user.name ?? undefined,
		image: user.image ?? undefined,
		activeOrganizationId: user.activeOrganizationId ?? null,
	};
}

function normalizeCachedContext(cached: AuthContext): AuthContext | null {
	if (!cached.userId) return null;
	if (
		cached.authType !== "session" &&
		cached.authType !== "apikey" &&
		cached.authType !== "internal"
	) {
		return null;
	}
	return {
		userId: cached.userId,
		organizationId: cached.organizationId ?? null,
		platformRole: cached.platformRole ?? null,
		authType: cached.authType ?? "session",
		...(cached.apiKeyId ? { apiKeyId: cached.apiKeyId } : {}),
	};
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
		await redis.set(indexKey, existing, ttl);
		return;
	}
	await redis.set(indexKey, [...existing, token], ttl);
}
