import { PLATFORM_ADMIN_ROLE } from "../../roles";
import type { ResolverDeps } from "./resolver-deps";
import { resolveSessionAuth } from "./resolve-session-auth";
import type { AuthContext } from "../types";

/** Platform Admin session only (no API key). */
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
