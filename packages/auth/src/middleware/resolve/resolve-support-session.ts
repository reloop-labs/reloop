import { PLATFORM_ADMIN_ROLE } from "../../roles";
import { extractSessionToken } from "../keys/extract-session-token";
import type { ResolverDeps } from "./resolver-deps";
import { resolveSessionAuthWithProfile } from "./resolve-session-auth-with-profile";
import { sessionTokenCacheKey } from "../keys/session-token-cache-key";
import type { AuthContext, SupportAuthContext } from "../types";

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
