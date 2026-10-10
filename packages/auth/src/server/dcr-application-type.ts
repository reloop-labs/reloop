const LOOPBACK_HTTP =
	/^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?(\/|$)/i;
const WEB_SCHEME = /^https?:/i;

function isNativeOnlyRedirect(uri: unknown): boolean {
	if (typeof uri !== "string") return false;
	return LOOPBACK_HTTP.test(uri) || !WEB_SCHEME.test(uri);
}

/**
 * RFC 7591 / OIDC DCR treat `application_type` "web" (the default) as
 * https-only. MCP clients (Cursor, Claude Code, Windsurf) are desktop or CLI
 * apps that register loopback (`http://127.0.0.1:<port>/…`) or private-use
 * (`cursor://…`) redirects, yet omit `application_type` or send "web", so
 * Better Auth rejects them. A web client can never use such a redirect, so
 * when one is present the client is native: register it as such. Pure web
 * registrations (https-only) are untouched.
 */
export function withNativeApplicationTypeDefault(
	body: unknown,
): Record<string, unknown> | null {
	if (!body || typeof body !== "object") return null;
	const registration = body as Record<string, unknown>;
	const applicationType = registration.application_type;
	if (applicationType !== undefined && applicationType !== "web") return null;
	const redirectUris = registration.redirect_uris;
	if (!Array.isArray(redirectUris)) return null;
	if (!redirectUris.some(isNativeOnlyRedirect)) return null;
	return { ...registration, application_type: "native" };
}
