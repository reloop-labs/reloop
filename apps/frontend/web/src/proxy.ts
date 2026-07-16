import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

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
 * Logged-in visitors hitting the marketing homepage should land in the app.
 * Other marketing routes stay reachable so users can still read docs, pricing, etc.
 */
export function proxy(request: NextRequest) {
	if (hasSessionCookie(request.headers.get("cookie"))) {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: "/",
};
