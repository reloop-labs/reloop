import {
	authServerMetadata,
	discoveryPreflight,
} from "@reloop/web/lib/oauth-discovery";

/** Better Auth's `openid-configuration` document, at the root and with the issuer path appended (RFC 8414). */
export function GET(request: Request) {
	return authServerMetadata(request, "openid-configuration");
}

export function OPTIONS() {
	return discoveryPreflight();
}
