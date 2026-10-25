import { type NextRequest, NextResponse } from "next/server";

/**
 * Better Auth cookiePrefix `reloop` → `reloop.session_token`.
 * On HTTPS the Secure flag names the cookie `__Secure-reloop.session_token`
 * (and occasionally `__Host-…`). Keep this check local so the proxy stays
 * free of workspace package imports.
 */
function hasSessionCookie(cookieHeader: string | null): boolean {
	if (!cookieHeader) return false;
	return /(?:^|;\s*)(?:__Secure-|__Host-)?reloop\.session_token=/.test(
		cookieHeader,
	);
}

/**
 * Chrome origin-trial token enabling WebMCP (`document.modelContext`) on
 * reloop.sh and subdomains. Public by design; expires 2027-03-30. Renew at
 * https://developer.chrome.com/origintrials/#/register_trial/4163014905550602241
 * or override at runtime with WEBMCP_ORIGIN_TRIAL_TOKEN.
 */
const WEBMCP_ORIGIN_TRIAL_TOKEN =
	"Aoq6kttLejAETbt/zdQat/n22+MCBi7IqW210U22jMnWNhNI3l0TXxxffASoX2QxpniI4EKDqSzzjliYkngPiQsAAABceyJvcmlnaW4iOiJodHRwczovL3JlbG9vcC5zaDo0NDMiLCJmZWF0dXJlIjoiV2ViTUNQIiwiZXhwaXJ5IjoxODA2MzY0ODAwLCJpc1N1YmRvbWFpbiI6dHJ1ZX0=";

/**
 * Logged-in visitors hitting the marketing homepage should land in the app.
 * Other marketing routes stay reachable so users can still read docs, pricing, etc.
 */
export function proxy(request: NextRequest) {
	if (
		request.nextUrl.pathname === "/" &&
		hasSessionCookie(request.headers.get("cookie"))
	) {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	const response = NextResponse.next();
	response.headers.set(
		"Origin-Trial",
		process.env.WEBMCP_ORIGIN_TRIAL_TOKEN || WEBMCP_ORIGIN_TRIAL_TOKEN,
	);
	return response;
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
