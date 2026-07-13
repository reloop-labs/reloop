import type { ResolverDeps } from "./resolver-deps";
import { resolveSessionWithProfile } from "../session/resolve-session-with-profile";
import type { AuthContextWithProfile } from "../types";

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
