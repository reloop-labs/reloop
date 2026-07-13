import type { ResolverDeps } from "./resolver-deps";
import { resolveSession } from "./resolve-session";
import type { AuthContext } from "./types";

/** Resolve Session from cookie (lean AuthContext). */
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
