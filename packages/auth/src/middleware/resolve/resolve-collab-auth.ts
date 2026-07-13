import { resolveApiKeyAuth } from "@reloop/auth/middleware/resolve/resolve-api-key-auth";
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
	if (!profile?.organizationId) return null;
	return profile;
}
