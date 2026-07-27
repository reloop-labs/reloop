import { timingSafeEqual } from "node:crypto";
import type { ResolverDeps } from "@reloop/auth/middleware/resolve/resolver-deps";
import {
	type AuthContext,
	INTERNAL_ORG_ID_HEADER,
	INTERNAL_SECRET_HEADER,
	INTERNAL_USER_ID_HEADER,
} from "@reloop/auth/middleware/types";

/**
 * Constant-time string equality for secrets.
 * Rejects when lengths differ without comparing contents.
 */
export function timingSafeStringEqual(a: string, b: string): boolean {
	const bufA = Buffer.from(a, "utf8");
	const bufB = Buffer.from(b, "utf8");
	if (bufA.length !== bufB.length) return false;
	return timingSafeEqual(bufA, bufB);
}

export function resolveInternalAuth(
	headers: Headers,
	deps: Pick<ResolverDeps, "internalSecret">,
): AuthContext | null {
	const secret = deps.internalSecret;
	if (!secret) return null;

	const provided = headers.get(INTERNAL_SECRET_HEADER);
	const userId = headers.get(INTERNAL_USER_ID_HEADER);
	const organizationId = headers.get(INTERNAL_ORG_ID_HEADER);

	if (!provided || !timingSafeStringEqual(provided, secret)) return null;
	if (!userId || !organizationId) return null;

	return {
		userId,
		organizationId,
		platformRole: null,
		authType: "internal",
	};
}
