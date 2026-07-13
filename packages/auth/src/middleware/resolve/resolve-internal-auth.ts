import type { ResolverDeps } from "@reloop/auth/middleware/resolve/resolver-deps";
import {
	type AuthContext,
	INTERNAL_ORG_ID_HEADER,
	INTERNAL_SECRET_HEADER,
	INTERNAL_USER_ID_HEADER,
} from "@reloop/auth/middleware/types";

export function resolveInternalAuth(
	headers: Headers,
	deps: Pick<ResolverDeps, "internalSecret">,
): AuthContext | null {
	const secret = deps.internalSecret;
	if (!secret) return null;

	const provided = headers.get(INTERNAL_SECRET_HEADER);
	const userId = headers.get(INTERNAL_USER_ID_HEADER);
	const organizationId = headers.get(INTERNAL_ORG_ID_HEADER);

	if (!provided || provided !== secret) return null;
	if (!userId || !organizationId) return null;

	return {
		userId,
		organizationId,
		platformRole: null,
		authType: "internal",
	};
}
