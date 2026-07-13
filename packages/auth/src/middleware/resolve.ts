import { validateApiKey } from "../apikey/validate";
import { PLATFORM_ADMIN_ROLE } from "../roles";
import { extractSessionToken, sessionTokenCacheKey } from "./keys";
import { resolveSession, resolveSessionWithProfile } from "./session";
import {
	type AuthContext,
	type AuthContextWithProfile,
	type AuthRedis,
	type SupportAuthContext,
	INTERNAL_ORG_ID_HEADER,
	INTERNAL_SECRET_HEADER,
	INTERNAL_USER_ID_HEADER,
} from "./types";

export type ResolverDeps = {
	baseUrl: string;
	redis: AuthRedis;
	ttl: number;
	internalSecret?: string;
};

function extractApiKey(headers: Headers): string | null {
	const raw =
		headers.get("x-api-key") ||
		headers.get("authorization")?.replace(/^Bearer\s+/i, "");
	return raw || null;
}

/**
 * Resolve API Key from headers. Returns null if no key header.
 * When a key header is present but invalid, returns `{ invalid: true }`
 * so callers can fail closed without falling through.
 */
export async function resolveApiKeyAuth(
	headers: Headers,
	deps: Pick<ResolverDeps, "redis">,
	opts: { requireOrg: boolean } = { requireOrg: true },
): Promise<
	| { ok: true; ctx: AuthContext }
	| { ok: false; invalid: true }
	| { ok: false; invalid: false }
> {
	const apiKey = extractApiKey(headers);
	if (!apiKey) return { ok: false, invalid: false };

	const result = await validateApiKey(apiKey, deps.redis);
	if (!result) return { ok: false, invalid: true };
	if (opts.requireOrg && !result.organizationId) {
		return { ok: false, invalid: true };
	}

	return {
		ok: true,
		ctx: {
			userId: result.userId,
			organizationId: result.organizationId,
			platformRole: null,
			authType: "apikey",
			apiKeyId: result.apiKeyId,
		},
	};
}

/**
 * Resolve internal service auth from headers.
 * Requires x-internal-secret + x-user-id + x-organization-id.
 */
export function resolveInternalAuth(
	headers: Headers,
	deps: Pick<ResolverDeps, "internalSecret">,
): AuthContext | null {
	const secret = deps.internalSecret;
	if (!secret) return null;

	const provided = headers.get(INTERNAL_SECRET_HEADER);
	const userId = headers.get(INTERNAL_USER_ID_HEADER);
	const organizationId = headers.get(INTERNAL_ORG_ID_HEADER);

	if (!provided || provided !== secret) return null;
	if (!userId || !organizationId) return null;

	return {
		userId,
		organizationId,
		platformRole: null,
		authType: "internal",
	};
}

/**
 * Resolve Session from cookie (lean AuthContext).
 */
export async function resolveSessionAuth(
	headers: Headers,
	deps: ResolverDeps,
	opts: { requireOrg: boolean },
): Promise<AuthContext | null> {
	return resolveSession(headers.get("cookie"), {
		baseUrl: deps.baseUrl,
		redis: deps.redis,
		ttl: deps.ttl,
		requireOrg: opts.requireOrg,
	});
}

/**
 * Resolve Session with profile fields (one get-session on cache miss).
 */
export async function resolveSessionAuthWithProfile(
	headers: Headers,
	deps: ResolverDeps,
	opts: { requireOrg: boolean },
): Promise<AuthContextWithProfile | null> {
	return resolveSessionWithProfile(headers.get("cookie"), {
		baseUrl: deps.baseUrl,
		redis: deps.redis,
		ttl: deps.ttl,
		requireOrg: opts.requireOrg,
	});
}

/**
 * Session or API Key. Prefer API key when key header is present
 * (invalid key → fail closed, no session fallthrough).
 */
export async function resolveSessionOrApiKey(
	headers: Headers,
	deps: ResolverDeps,
	opts: { requireOrg: boolean },
): Promise<AuthContext | null> {
	const keyResult = await resolveApiKeyAuth(headers, deps, {
		requireOrg: opts.requireOrg,
	});
	if (keyResult.ok) return keyResult.ctx;
	if (keyResult.invalid) return null;

	return resolveSessionAuth(headers, deps, opts);
}

/**
 * API Key, then internal. Fail closed on invalid key.
 */
export async function resolveApiKeyOrInternal(
	headers: Headers,
	deps: ResolverDeps,
): Promise<AuthContext | null> {
	const keyResult = await resolveApiKeyAuth(headers, deps, {
		requireOrg: true,
	});
	if (keyResult.ok) return keyResult.ctx;
	if (keyResult.invalid) return null;

	return resolveInternalAuth(headers, deps);
}

/**
 * Platform Admin session only (no API key).
 */
export async function resolvePlatformAdmin(
	headers: Headers,
	deps: ResolverDeps,
): Promise<AuthContext | null> {
	const session = await resolveSessionAuth(headers, deps, {
		requireOrg: false,
	});
	if (!session) return null;
	if (session.platformRole !== PLATFORM_ADMIN_ROLE) return null;
	return session;
}

/**
 * Support: any signed-in session; org optional; isPlatformAdmin derived.
 * Lean session cache hit → identity without profile. Miss → one get-session
 * (writes lean cache + returns profile fields).
 */
export async function resolveSupportSession(
	headers: Headers,
	deps: ResolverDeps,
): Promise<SupportAuthContext | null> {
	const cookie = headers.get("cookie");
	if (!cookie) return null;

	// Cache-first lean path (shared seam with auth / authAdmin).
	const token = extractSessionToken(cookie);
	if (token) {
		const cached = await deps.redis.get<AuthContext>(
			sessionTokenCacheKey(token),
		);
		if (cached?.userId && cached.authType === "session") {
			return {
				userId: cached.userId,
				organizationId: cached.organizationId,
				platformRole: cached.platformRole,
				authType: "session",
				isPlatformAdmin: cached.platformRole === PLATFORM_ADMIN_ROLE,
			};
		}
	}

	const profile = await resolveSessionAuthWithProfile(headers, deps, {
		requireOrg: false,
	});
	if (!profile) return null;

	return {
		userId: profile.userId,
		organizationId: profile.organizationId,
		platformRole: profile.platformRole,
		authType: "session",
		isPlatformAdmin: profile.platformRole === PLATFORM_ADMIN_ROLE,
		userEmail: profile.userEmail,
		userName: profile.userName,
		userImage: profile.userImage,
	};
}

/**
 * Collab: session or API key, fail-closed org, profile when session.
 */
export async function resolveCollabAuth(
	headers: Headers,
	deps: ResolverDeps,
): Promise<AuthContextWithProfile | null> {
	const keyResult = await resolveApiKeyAuth(headers, deps, {
		requireOrg: true,
	});
	if (keyResult.ok) {
		return {
			...keyResult.ctx,
			userEmail: undefined,
			userName: undefined,
			userImage: undefined,
		};
	}
	if (keyResult.invalid) return null;

	const profile = await resolveSessionAuthWithProfile(headers, deps, {
		requireOrg: true,
	});
	if (!profile?.organizationId) return null;
	return profile;
}

/**
 * Mail-style composer: API key → internal → session (fail-closed org).
 * Invalid API key does not fall through.
 */
export async function resolveApiKeyInternalOrSession(
	headers: Headers,
	deps: ResolverDeps,
): Promise<AuthContext | null> {
	const keyResult = await resolveApiKeyAuth(headers, deps, {
		requireOrg: true,
	});
	if (keyResult.ok) return keyResult.ctx;
	if (keyResult.invalid) return null;

	const internal = resolveInternalAuth(headers, deps);
	if (internal) return internal;

	return resolveSessionAuth(headers, deps, { requireOrg: true });
}
