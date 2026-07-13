import type { AuthContext } from "@reloop/auth/middleware/types";
import { resolveApiKeyAuth } from "@reloop/auth/middleware/resolve/resolve-api-key-auth";
import { resolveSessionAuth } from "@reloop/auth/middleware/resolve/resolve-session-auth";
import type { ResolverDeps } from "@reloop/auth/middleware/resolve/resolver-deps";

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

	return resolveSessionAuth(headers, deps, opts);
}
