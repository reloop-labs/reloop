/**
 * Format an endpoint URL for display: pathname only, no trailing slash,
 * and strip a leading `/api` segment so paths read like `/v1/emails`.
 */
export function formatDisplayEndpoint(url: string): string {
	let path: string;
	try {
		path = new URL(url).pathname;
	} catch {
		path = url;
	}

	if (path.length > 1 && path.endsWith("/")) {
		path = path.slice(0, -1);
	}

	// /api → /
	if (path === "/api") {
		return "/";
	}
	// /api/v1/... → /v1/...
	if (path.startsWith("/api/")) {
		path = path.slice(4);
	}

	return path;
}
