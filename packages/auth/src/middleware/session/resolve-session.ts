import {
	extractSessionToken,
	sessionTokenCacheKey,
} from "@reloop/auth/middleware/keys";
import { addTokenToUserIndex } from "@reloop/auth/middleware/session/add-token-to-user-index";
import { fetchGetSession } from "@reloop/auth/middleware/session/fetch-get-session";
import { normalizeCachedContext } from "@reloop/auth/middleware/session/normalize-cached-context";
import type { ResolveSessionOptions } from "@reloop/auth/middleware/session/resolve-session-options";
import type { AuthContext } from "@reloop/auth/middleware/types";
import { db } from "@reloop/db/client";
import { user } from "@reloop/db/schema";
import { eq } from "drizzle-orm";
import { isUserBanned } from "@reloop/auth/user/is-banned";

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
		// Banned users must not authenticate via cached session (fail closed)
		try {
			const u = await db.query.user.findFirst({
				where: eq(user.id, lean.userId),
				columns: { banned: true, banExpires: true },
			});
			if (isUserBanned(u)) {
				await opts.redis.delete(cacheKey).catch(() => undefined);
				return null;
			}
		} catch {}
		return lean;
	}

	const fetched = await fetchGetSession(cookie, opts.baseUrl);
	if (!fetched) return null;

	// Banned check on fresh fetch (also covers race where cache was empty)
	try {
		const u = await db.query.user.findFirst({
			where: eq(user.id, fetched.id),
			columns: { banned: true, banExpires: true },
		});
		if (isUserBanned(u)) return null;
	} catch {}

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
