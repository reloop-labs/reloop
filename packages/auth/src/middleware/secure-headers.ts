import { Elysia } from "elysia";

export type SecureHeadersProfile = "api" | "docs";

export type SecureHeadersOptions = {
	/**
	 * `api` — strict CSP for JSON microservices.
	 * `docs` — slightly looser for OpenAPI HTML UIs (still frames blocked).
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
};

const HSTS_VALUE = "max-age=63072000; includeSubDomains; preload";
const REFERRER = "strict-origin-when-cross-origin";
const PERMISSIONS =
	"camera=(), microphone=(), geolocation=(), payment=(), usb=()";

const CSP_API = "default-src 'none'; frame-ancestors 'none'";
/** Allow OpenAPI/Swagger-style pages to load basic assets; still no framing. */
const CSP_DOCS =
	"default-src 'self'; base-uri 'self'; frame-ancestors 'none'; object-src 'none'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'";

/**
 * Helmet-style response headers for Elysia services.
 * Apply once on the root app: `.use(secureHeadersPlugin())`.
 *
 * Uses Elysia's static `.headers()` so values apply to every response
 * without relying on afterHandle lifecycle quirks.
 */
export function secureHeadersPlugin(opts: SecureHeadersOptions = {}) {
	const profile = opts.profile ?? "api";
	const nodeEnv = opts.nodeEnv ?? process.env.NODE_ENV;
	const hsts = opts.hsts ?? nodeEnv === "production";
	const csp = profile === "docs" ? CSP_DOCS : CSP_API;

	const headers: Record<string, string> = {
		"X-Content-Type-Options": "nosniff",
		"X-Frame-Options": "DENY",
		"Referrer-Policy": REFERRER,
		"Permissions-Policy": PERMISSIONS,
		"Content-Security-Policy": csp,
	};

	if (hsts) {
		headers["Strict-Transport-Security"] = HSTS_VALUE;
	}

	return new Elysia({ name: "reloop-secure-headers" }).headers(headers);
}

export const SECURE_HEADERS_VALUES = {
	hsts: HSTS_VALUE,
	referrer: REFERRER,
	permissions: PERMISSIONS,
	cspApi: CSP_API,
	cspDocs: CSP_DOCS,
} as const;
