/**
 * Two reverse-proxy concerns for the dashboard (`vite.base` + router `basepath`
 * are both `/dashboard`):
 *
 * 1. Coolify/Traefik often **strips** `/dashboard` before the container.
 *    TanStack then 307s back to `/dashboard/...`, Coolify strips again → loop
 *    (ERR_TOO_MANY_REDIRECTS). Re-prefix stripped app routes on the fetch
 *    boundary (no HTTP redirect).
 *
 * 2. The browser requests static files under `/dashboard/assets/*` (vite base),
 *    but Nitro's default public asset map is `/assets/*`. Strip that prefix for
 *    static files so local Caddy (no strip) and production both work.
 *
 * Nitro 3 / srvx uses the Fetch API — rewrite `Request.url`, not Node `req.url`.
 */
import { definePlugin } from "nitro";

const BASE = "/dashboard";

/** Paths that are static files under vite `base`, not TanStack routes. */
function isStaticUnderBase(pathname: string): boolean {
	if (!pathname.startsWith(`${BASE}/`)) return false;
	const rest = pathname.slice(BASE.length);
	return (
		rest.startsWith("/assets/") ||
		rest.startsWith("/font/") ||
		rest === "/favicon.ico" ||
		rest === "/robots.txt" ||
		rest === "/manifest.json" ||
		rest.startsWith("/logo") ||
		rest.startsWith("/reloop-logo")
	);
}

function normalizeDashboardRequest(request: Request): Request {
	let url: URL;
	try {
		url = new URL(request.url);
	} catch {
		return request;
	}

	const { pathname } = url;

	// /dashboard/assets/* → /assets/* (Nitro public map)
	if (isStaticUnderBase(pathname)) {
		url.pathname = pathname.slice(BASE.length) || "/";
		return new Request(url, request);
	}

	// Already correctly prefixed app path
	if (pathname === BASE || pathname.startsWith(`${BASE}/`)) {
		return request;
	}

	// Coolify strip-prefix: restore /dashboard for app routes
	url.pathname =
		pathname === "/"
			? `${BASE}/`
			: `${BASE}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
	return new Request(url, request);
}

export default definePlugin((nitroApp) => {
	const originalFetch = nitroApp.fetch.bind(nitroApp);
	nitroApp.fetch = (request: Request) =>
		originalFetch(normalizeDashboardRequest(request));
});
