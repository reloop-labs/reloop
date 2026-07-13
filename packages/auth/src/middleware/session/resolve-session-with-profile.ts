import { addTokenToUserIndex } from "./add-token-to-user-index";
import { fetchGetSession } from "./fetch-get-session";
import type { ResolveSessionOptions } from "./resolve-session-options";
import type { AuthContext, AuthContextWithProfile } from "../types";
import { extractSessionToken, sessionTokenCacheKey } from "../keys";

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
