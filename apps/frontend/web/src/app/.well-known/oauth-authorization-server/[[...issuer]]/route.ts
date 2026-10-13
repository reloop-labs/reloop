import {
	authServerMetadata,
	discoveryPreflight,
} from "@reloop/web/lib/oauth-discovery";

/** Better Auth's `oauth-authorization-server` document, at the root and with the issuer path appended (RFC 8414). */
export function GET(request: Request) {
	return authServerMetadata(request, "oauth-authorization-server");
}

export function OPTIONS() {
	return discoveryPreflight();
}
