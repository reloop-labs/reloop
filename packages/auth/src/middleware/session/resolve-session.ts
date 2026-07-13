import { extractSessionToken, sessionTokenCacheKey } from "@reloop/auth/middleware/keys";
import type { AuthContext } from "@reloop/auth/middleware/types";
import { addTokenToUserIndex } from "@reloop/auth/middleware/session/add-token-to-user-index";
import { fetchGetSession } from "@reloop/auth/middleware/session/fetch-get-session";
import { normalizeCachedContext } from "@reloop/auth/middleware/session/normalize-cached-context";
import type { ResolveSessionOptions } from "@reloop/auth/middleware/session/resolve-session-options";

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
