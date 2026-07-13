import { PLATFORM_ADMIN_ROLE } from "@reloop/auth/roles";
import { extractSessionToken, sessionTokenCacheKey } from "@reloop/auth/middleware/keys";
import type { AuthContext, SupportAuthContext } from "@reloop/auth/middleware/types";
import { resolveSessionAuthWithProfile } from "@reloop/auth/middleware/resolve/resolve-session-auth-with-profile";
import type { ResolverDeps } from "@reloop/auth/middleware/resolve/resolver-deps";

export async function resolveSupportSession(
	headers: Headers,
	deps: ResolverDeps,
): Promise<SupportAuthContext | null> {
	const cookie = headers.get("cookie");
	if (!cookie) return null;

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
