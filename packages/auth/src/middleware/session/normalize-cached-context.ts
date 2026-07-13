import type { AuthContext } from "../types";

/** Validate and normalize a lean AuthContext read from the session cache. */
export function normalizeCachedContext(cached: AuthContext): AuthContext | null {
	if (!cached.userId) return null;
	if (
		cached.authType !== "session" &&
		cached.authType !== "apikey" &&
		cached.authType !== "internal"
	) {
		return null;
	}
	return {
		userId: cached.userId,
		organizationId: cached.organizationId ?? null,
		platformRole: cached.platformRole ?? null,
		authType: cached.authType ?? "session",
		...(cached.apiKeyId ? { apiKeyId: cached.apiKeyId } : {}),
	};
}
