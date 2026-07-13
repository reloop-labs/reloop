import { resolveSessionAuth } from "@reloop/auth/middleware/resolve/resolve-session-auth";
import type { ResolverDeps } from "@reloop/auth/middleware/resolve/resolver-deps";
import type { AuthContext } from "@reloop/auth/middleware/types";
import { PLATFORM_ADMIN_ROLE } from "@reloop/auth/roles";

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
