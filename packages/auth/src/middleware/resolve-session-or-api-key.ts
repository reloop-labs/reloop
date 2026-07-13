import { resolveApiKeyAuth } from "./resolve-api-key-auth";
import type { ResolverDeps } from "./resolver-deps";
import { resolveSessionAuth } from "./resolve-session-auth";
import type { AuthContext } from "./types";

/**
 * Session or API Key. Prefer API key when key header is present
 * (invalid key → fail closed, no session fallthrough).
 */
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
