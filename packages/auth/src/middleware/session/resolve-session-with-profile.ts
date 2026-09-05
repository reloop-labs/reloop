import {
	extractSessionToken,
	sessionTokenCacheKey,
} from "@reloop/auth/middleware/keys";
import { addTokenToUserIndex } from "@reloop/auth/middleware/session/add-token-to-user-index";
import { fetchGetSession } from "@reloop/auth/middleware/session/fetch-get-session";
import type { ResolveSessionOptions } from "@reloop/auth/middleware/session/resolve-session-options";
import type {
	AuthContext,
	AuthContextWithProfile,
} from "@reloop/auth/middleware/types";
import { db } from "@reloop/db/client";
import { user } from "@reloop/db/schema";
import { eq } from "drizzle-orm";
import { isUserBanned } from "@reloop/auth/user/is-banned";

export async function resolveSessionWithProfile(
	cookie: string | null,
	opts: ResolveSessionOptions,
): Promise<AuthContextWithProfile | null> {
	if (!cookie) return null;

	const token = extractSessionToken(cookie);
	if (!token) return null;

	const fetched = await fetchGetSession(cookie, opts.baseUrl);
	if (!fetched) return null;

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
