import { Elysia } from "elysia";

export type RequireUserAgentOptions = {
	/**
	 * Path suffixes (matched against URL pathname) that skip the User-Agent check.
	 * Defaults cover health, landing root, OpenAPI, and agent discovery.
	 */
	excludePathSuffixes?: string[];
};

const DEFAULT_EXCLUDE_SUFFIXES = [
	"/health",
	"/openapi",
	"/openapi/json",
	"/swagger",
	"/agent-card.json",
];

function pathnameOf(request: Request): string {
	try {
		return new URL(request.url).pathname.replace(/\/+$/, "") || "/";
	} catch {
		return request.url;
	}
}

function isExcluded(pathname: string, suffixes: string[]): boolean {
	// Exact service root (landing)
	if (pathname === "/" || pathname === "") return true;

	for (const suffix of suffixes) {
		if (pathname === suffix || pathname.endsWith(suffix)) return true;
	}
	return false;
}

/**
 * Reject API requests that omit a non-empty User-Agent header.
 * Uses `.as("global")` so the hook applies to host routes after `.use()`.
 */
export function requireUserAgentPlugin(opts: RequireUserAgentOptions = {}) {
	const exclude = opts.excludePathSuffixes ?? DEFAULT_EXCLUDE_SUFFIXES;

	return new Elysia({ name: "reloop-require-user-agent" })
		.onBeforeHandle(({ request, set }) => {
			const path = pathnameOf(request);
			if (isExcluded(path, exclude)) return;

			const ua = request.headers.get("user-agent")?.trim();
			if (ua) return;

			set.status = 400;
			return {
				message: "User-Agent header is required",
				why: "All API requests must include a non-empty User-Agent header so traffic can be attributed and abuse can be reduced.",
				fix: "Send a User-Agent header identifying your client, e.g. MyApp/1.0 or the official Reloop SDK user agent.",
			};
		})
		.as("global");
}
