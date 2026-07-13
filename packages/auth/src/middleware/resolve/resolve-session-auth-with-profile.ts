import type { ResolverDeps } from "@reloop/auth/middleware/resolve/resolver-deps";
import { resolveSessionWithProfile } from "@reloop/auth/middleware/session/resolve-session-with-profile";
import type { AuthContextWithProfile } from "@reloop/auth/middleware/types";

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
