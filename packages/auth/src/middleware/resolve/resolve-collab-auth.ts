import { resolveApiKeyAuth } from "@reloop/auth/middleware/resolve/resolve-api-key-auth";
import { resolveOAuthAuth } from "@reloop/auth/middleware/resolve/resolve-oauth-auth";
import { resolveSessionAuthWithProfile } from "@reloop/auth/middleware/resolve/resolve-session-auth-with-profile";
import type { ResolverDeps } from "@reloop/auth/middleware/resolve/resolver-deps";
import type { AuthContextWithProfile } from "@reloop/auth/middleware/types";

export async function resolveCollabAuth(
	headers: Headers,
	deps: ResolverDeps,
): Promise<AuthContextWithProfile | null> {
	const keyResult = await resolveApiKeyAuth(headers, deps, {
		requireOrg: true,
	});
	if (keyResult.ok) {
		return {
			...keyResult.ctx,
			userEmail: undefined,
			userName: undefined,
			userImage: undefined,
		};
	}
	if (keyResult.invalid) return null;

	const profile = await resolveSessionAuthWithProfile(headers, deps, {
		requireOrg: true,
	});
	if (profile?.organizationId) return profile;

	const oauth = await resolveOAuthAuth(headers, deps, { requireOrg: true });
	if (!oauth?.organizationId) return null;
	return {
		...oauth,
		userEmail: undefined,
		userName: undefined,
		userImage: undefined,
	};
}
