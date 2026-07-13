import { resolveApiKeyAuth } from "@reloop/auth/middleware/resolve/resolve-api-key-auth";
import { resolveInternalAuth } from "@reloop/auth/middleware/resolve/resolve-internal-auth";
import { resolveSessionAuth } from "@reloop/auth/middleware/resolve/resolve-session-auth";
import type { ResolverDeps } from "@reloop/auth/middleware/resolve/resolver-deps";
import type { AuthContext } from "@reloop/auth/middleware/types";

export async function resolveApiKeyInternalOrSession(
	headers: Headers,
	deps: ResolverDeps,
): Promise<AuthContext | null> {
	const keyResult = await resolveApiKeyAuth(headers, deps, {
		requireOrg: true,
	});
	if (keyResult.ok) return keyResult.ctx;
	if (keyResult.invalid) return null;

	const internal = resolveInternalAuth(headers, deps);
	if (internal) return internal;

	return resolveSessionAuth(headers, deps, { requireOrg: true });
}
