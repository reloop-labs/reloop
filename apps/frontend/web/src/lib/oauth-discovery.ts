/**
 * OAuth discovery for MCP clients (Claude, Cursor, ChatGPT, …), served from the
 * marketing site because it owns the origin root. MCP clients read
 * `/.well-known/*` at the root of the MCP server's origin; answering here means
 * the hosted proxy only needs its usual `/mcp*` and `/api/auth*` routes.
 *
 * - Protected-resource metadata (RFC 9728) is static and mirrors
 *   `protectedResourceMetadata()` in apps/backend/mcp.
 * - Authorization-server metadata (RFC 8414 / OIDC) is fetched from Better Auth
 *   at its issuer-scoped path so the endpoints never drift from the auth server.
 */

export const AUTH_ISSUER_PATH = "/api/auth/v1";
export const MCP_PATH = "/mcp";

export const DISCOVERY_CORS_HEADERS = {
	"access-control-allow-origin": "*",
	"access-control-allow-methods": "GET, HEAD, OPTIONS",
	"access-control-allow-headers": "*",
} as const;

const DISCOVERY_CACHE = "public, max-age=300";
const AUTH_FETCH_TIMEOUT_MS = 5000;

/** Public origin the client used, honoring the reverse proxy's forwarded headers. */
export function publicOrigin(request: Request): string {
	const url = new URL(request.url);
	const host =
		request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
		request.headers.get("host") ||
		url.host;
	const proto =
		request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
		url.protocol.replace(":", "");
	return `${proto}://${host}`;
}

export function discoveryPreflight(): Response {
	return new Response(null, { status: 204, headers: DISCOVERY_CORS_HEADERS });
}

export function protectedResourceMetadata(request: Request): Response {
	const origin = publicOrigin(request);
	return Response.json(
		{
			resource: `${origin}${MCP_PATH}`,
			authorization_servers: [`${origin}${AUTH_ISSUER_PATH}`],
			scopes_supported: ["openid", "profile", "email"],
			bearer_methods_supported: ["header"],
		},
		{
			headers: { ...DISCOVERY_CORS_HEADERS, "cache-control": DISCOVERY_CACHE },
		},
	);
}

export async function authServerMetadata(
	request: Request,
	document: "oauth-authorization-server" | "openid-configuration",
): Promise<Response> {
	const upstream = `${publicOrigin(request)}${AUTH_ISSUER_PATH}/.well-known/${document}`;
	try {
		const response = await fetch(upstream, {
			headers: { accept: "application/json" },
			cache: "no-store",
			signal: AbortSignal.timeout(AUTH_FETCH_TIMEOUT_MS),
		});
		if (!response.ok) {
			return discoveryError(502, `Auth server returned ${response.status}`);
		}
		return new Response(await response.text(), {
			status: 200,
			headers: {
				...DISCOVERY_CORS_HEADERS,
				"content-type": "application/json",
				"cache-control": DISCOVERY_CACHE,
			},
		});
	} catch {
		return discoveryError(502, "Auth server is unreachable");
	}
}

function discoveryError(status: number, message: string): Response {
	return Response.json(
		{ error: "discovery_unavailable", message },
		{
			status,
			headers: { ...DISCOVERY_CORS_HEADERS, "cache-control": "no-store" },
		},
	);
}
