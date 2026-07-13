import { resolveApiKeyAuth } from "./resolve-api-key-auth";
import { resolveInternalAuth } from "./resolve-internal-auth";
import type { ResolverDeps } from "./resolver-deps";
import type { AuthContext } from "./types";

/** API Key, then internal. Fail closed on invalid key. */
export async function resolveApiKeyOrInternal(
	headers: Headers,
	deps: ResolverDeps,
): Promise<AuthContext | null> {
	const keyResult = await resolveApiKeyAuth(headers, deps, {
		requireOrg: true,
	});
	if (keyResult.ok) return keyResult.ctx;
	if (keyResult.invalid) return null;

	return resolveInternalAuth(headers, deps);
}
