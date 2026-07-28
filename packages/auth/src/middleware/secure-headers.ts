import { Elysia } from "elysia";

export type SecureHeadersProfile = "api" | "docs";

export type SecureHeadersOptions = {
	/**
	 * `api` — strict CSP for JSON microservices; OpenAPI/Swagger HTML paths
	 *         automatically get the docs CSP (Scalar/Swagger CDN + fonts).
	 * `docs` — docs CSP on every response (still frames blocked).
	 */
	profile?: SecureHeadersProfile;
	/**
	 * Emit HSTS. Defaults to true when NODE_ENV is production.
	 * Disable for plain-HTTP local stacks.
	 */
	hsts?: boolean;
	/**
	 * Override NODE_ENV detection for tests.
	 */
	nodeEnv?: string;
	/**
	 * Pathname suffixes treated as OpenAPI/Swagger HTML UIs under the `api`
	 * profile. Spec JSON paths (`/openapi/json`) stay on the strict CSP.
	 */
	docsPathSuffixes?: string[];
};

const HSTS_VALUE = "max-age=63072000; includeSubDomains; preload";
const REFERRER = "strict-origin-when-cross-origin";
const PERMISSIONS =
	"camera=(), microphone=(), geolocation=(), payment=(), usb=()";

const CSP_API = "default-src 'none'; frame-ancestors 'none'";

/**
 * Allow Scalar (cdn.jsdelivr.net + Google Fonts) and Swagger UI (unpkg.com)
 * to load on OpenAPI HTML pages. Still no framing.
 */
const CSP_DOCS = [
	"default-src 'self'",
	"base-uri 'self'",
	"frame-ancestors 'none'",
	"object-src 'none'",
	"img-src 'self' data: blob: https:",
	"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://unpkg.com",
	"font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net https://unpkg.com",
	"script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com",
	"connect-src 'self' https://cdn.jsdelivr.net https://unpkg.com",
	"worker-src 'self' blob:",
].join("; ");

/** Default path suffixes for HTML docs UIs (not the JSON spec). */
const DEFAULT_DOCS_PATH_SUFFIXES = ["/openapi", "/swagger"];

function pathnameOf(request: Request): string {
	try {
		return new URL(request.url).pathname.replace(/\/+$/, "") || "/";
	} catch {
		return request.url;
	}
}

function isDocsUiPath(pathname: string, suffixes: string[]): boolean {
	// Spec JSON stays on the strict API CSP.
	if (
		pathname.endsWith("/openapi/json") ||
		pathname.endsWith("/swagger/json")
	) {
		return false;
	}

	for (const suffix of suffixes) {
		if (pathname === suffix || pathname.endsWith(suffix)) return true;
	}
	return false;
}

/**
 * Helmet-style response headers for Elysia services.
 * Apply once on the root app: `.use(secureHeadersPlugin())`.
 *
 * Uses a global `onAfterHandle` (not static `.headers()`) so:
 * 1. CSP can differ for OpenAPI HTML vs JSON API routes
 * 2. Headers are set once per response (avoids stacked CSP duplicates)
 */
export function secureHeadersPlugin(opts: SecureHeadersOptions = {}) {
	const profile = opts.profile ?? "api";
	const nodeEnv = opts.nodeEnv ?? process.env.NODE_ENV;
	const hsts = opts.hsts ?? nodeEnv === "production";
	const docsSuffixes = opts.docsPathSuffixes ?? DEFAULT_DOCS_PATH_SUFFIXES;

	return new Elysia({ name: "reloop-secure-headers" })
		.onAfterHandle(({ request, set }) => {
			const path = pathnameOf(request);
			const useDocsCsp =
				profile === "docs" ||
				(profile === "api" && isDocsUiPath(path, docsSuffixes));

			set.headers["X-Content-Type-Options"] = "nosniff";
			set.headers["X-Frame-Options"] = "DENY";
			set.headers["Referrer-Policy"] = REFERRER;
			set.headers["Permissions-Policy"] = PERMISSIONS;
			set.headers["Content-Security-Policy"] = useDocsCsp
				? CSP_DOCS
				: CSP_API;

			if (hsts) {
				set.headers["Strict-Transport-Security"] = HSTS_VALUE;
			}
		})
		.as("global");
}

export const SECURE_HEADERS_VALUES = {
	hsts: HSTS_VALUE,
	referrer: REFERRER,
	permissions: PERMISSIONS,
	cspApi: CSP_API,
	cspDocs: CSP_DOCS,
	docsPathSuffixes: DEFAULT_DOCS_PATH_SUFFIXES,
} as const;
