/**
 * Known insecure defaults that must never be used in production.
 * Matches historical config fallbacks in backend services.
 */
export const KNOWN_INSECURE_INTERNAL_SECRETS = [
	"reloop_internal_secret_default_123",
] as const;

export function isInsecureDefaultInternalSecret(
	secret: string | null | undefined,
): boolean {
	if (!secret) return false;
	return (KNOWN_INSECURE_INTERNAL_SECRETS as readonly string[]).includes(
		secret,
	);
}

/**
 * Prepare internal secret for the auth plugin.
 * In production, known defaults are rejected (internal auth disabled)
 * so a misconfigured deploy cannot be impersonated with a public default.
 */
export function sanitizeInternalSecret(
	secret: string | undefined,
	nodeEnv: string | undefined = process.env.NODE_ENV,
): string | undefined {
	if (!secret) return undefined;
	if (nodeEnv === "production" && isInsecureDefaultInternalSecret(secret)) {
		console.error(
			"[reloop-auth] RELOOP_INTERNAL_SECRET is a known insecure default; internal service auth is disabled. Set a strong unique secret.",
		);
		return undefined;
	}
	return secret;
}
