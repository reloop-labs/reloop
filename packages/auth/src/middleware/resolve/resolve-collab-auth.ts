import { resolveApiKeyAuth } from "./resolve-api-key-auth";
import type { ResolverDeps } from "./resolver-deps";
import { resolveSessionAuthWithProfile } from "./resolve-session-auth-with-profile";
import type { AuthContextWithProfile } from "../types";

/** Collab: session or API key, fail-closed org, profile when session. */
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
