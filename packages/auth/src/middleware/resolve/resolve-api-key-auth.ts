import { validateApiKey } from "@reloop/auth/apikey/validate";
import type { AuthContext } from "@reloop/auth/middleware/types";
import { extractApiKey } from "@reloop/auth/middleware/resolve/extract-api-key";
import type { ResolverDeps } from "@reloop/auth/middleware/resolve/resolver-deps";

export async function resolveApiKeyAuth(
	headers: Headers,
	deps: Pick<ResolverDeps, "redis">,
	opts: { requireOrg: boolean } = { requireOrg: true },
): Promise<
	| { ok: true; ctx: AuthContext }
	| { ok: false; invalid: true }
	| { ok: false; invalid: false }
> {
	const apiKey = extractApiKey(headers);
	if (!apiKey) return { ok: false, invalid: false };

	const result = await validateApiKey(apiKey, deps.redis);
	if (!result) return { ok: false, invalid: true };
	if (opts.requireOrg && !result.organizationId) {
		return { ok: false, invalid: true };
	}

	return {
		ok: true,
		ctx: {
			userId: result.userId,
			organizationId: result.organizationId,
			platformRole: null,
			authType: "apikey",
			apiKeyId: result.apiKeyId,
		},
	};
}
