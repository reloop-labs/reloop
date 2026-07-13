import { resolveSession } from "@reloop/auth/middleware/session/resolve-session";
import type { AuthContext } from "@reloop/auth/middleware/types";
import type { ResolverDeps } from "@reloop/auth/middleware/resolve/resolver-deps";

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
