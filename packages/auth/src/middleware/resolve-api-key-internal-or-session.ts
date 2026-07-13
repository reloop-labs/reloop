import { resolveApiKeyAuth } from "./resolve-api-key-auth";
import { resolveInternalAuth } from "./resolve-internal-auth";
import type { ResolverDeps } from "./resolver-deps";
import { resolveSessionAuth } from "./resolve-session-auth";
import type { AuthContext } from "./types";

/**
 * Mail-style composer: API key → internal → session (fail-closed org).
 * Invalid API key does not fall through.
 */
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
