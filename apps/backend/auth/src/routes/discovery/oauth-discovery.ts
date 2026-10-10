import { auth } from "../../lib/auth";

const ISSUER_PATH = "/api/auth/v1";
const DISCOVERY_DOCUMENTS = [
	"oauth-authorization-server",
	"openid-configuration",
] as const;

/**
 * Maps root-level OAuth discovery URLs to the issuer-scoped document Better
 * Auth serves. RFC 8414 clients insert the issuer path after the well-known
 * segment (`/.well-known/oauth-authorization-server/api/auth/v1`); older MCP
 * clients request it at the origin root. Answering both here keeps every proxy
 * (local Caddy, Coolify/Traefik, self-host) a plain path route with no rewrite.
 */
export function oauthDiscoveryPath(pathname: string): string | null {
	for (const document of DISCOVERY_DOCUMENTS) {
		const prefix = `/.well-known/${document}`;
		if (pathname === prefix || pathname === `${prefix}${ISSUER_PATH}`) {
			return `${ISSUER_PATH}/.well-known/${document}`;
		}
	}
	return null;
}

const CORS_HEADERS = {
	"access-control-allow-origin": "*",
	"access-control-allow-methods": "GET, HEAD, OPTIONS",
	"access-control-allow-headers": "*",
};

export async function handleOAuthDiscovery(
	request: Request,
): Promise<Response | undefined> {
	const url = new URL(request.url);
	const path = oauthDiscoveryPath(url.pathname);
	if (!path) return undefined;
	if (request.method === "OPTIONS") {
		return new Response(null, { status: 204, headers: CORS_HEADERS });
	}
	if (request.method !== "GET" && request.method !== "HEAD") return undefined;
	url.pathname = path;
	const response = await auth.handler(new Request(url, request));
	const headers = new Headers(response.headers);
	for (const [name, value] of Object.entries(CORS_HEADERS)) {
		headers.set(name, value);
	}
	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers,
	});
}
