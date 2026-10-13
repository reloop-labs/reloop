import {
	discoveryPreflight,
	protectedResourceMetadata,
} from "@reloop/web/lib/oauth-discovery";

/** RFC 9728 metadata for `/mcp`, at the root and at `/.well-known/oauth-protected-resource/mcp`. */
export function GET(request: Request) {
	return protectedResourceMetadata(request);
}

export function OPTIONS() {
	return discoveryPreflight();
}
