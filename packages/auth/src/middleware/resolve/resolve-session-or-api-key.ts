import { resolveApiKeyAuth } from "@reloop/auth/middleware/resolve/resolve-api-key-auth";
import { resolveOAuthAuth } from "@reloop/auth/middleware/resolve/resolve-oauth-auth";
import { resolveSessionAuth } from "@reloop/auth/middleware/resolve/resolve-session-auth";
import type { ResolverDeps } from "@reloop/auth/middleware/resolve/resolver-deps";
import type { AuthContext } from "@reloop/auth/middleware/types";

export async function resolveSessionOrApiKey(
	headers: Headers,
	deps: ResolverDeps,
	opts: { requireOrg: boolean },
): Promise<AuthContext | null> {
	const keyResult = await resolveApiKeyAuth(headers, deps, {
		requireOrg: opts.requireOrg,
	});
	if (keyResult.ok) return keyResult.ctx;
	if (keyResult.invalid) return null;

	const session = await resolveSessionAuth(headers, deps, opts);
	if (session) return session;

	return resolveOAuthAuth(headers, deps, opts);
}
