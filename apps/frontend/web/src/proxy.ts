import { defineAiCrawlConfig } from "@traceten/ai-crawl";
import { trackAICrawlerRequest } from "@traceten/ai-crawl/next";
import {
	type NextFetchEvent,
	type NextRequest,
	NextResponse,
} from "next/server";

const siteId = process.env.TRACETEN_SITE_ID || "ttid_6w2QYo7Mo23D3Kwk6BJWKj";
const crawlToken = process.env.TRACETEN_CRAWL_TOKEN;

const aiCrawlConfig =
	siteId && crawlToken
		? defineAiCrawlConfig({
				siteId,
				authToken: crawlToken,
			})
		: null;

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
export function proxy(request: NextRequest, event: NextFetchEvent) {
	if (aiCrawlConfig) {
		trackAICrawlerRequest(request, event, aiCrawlConfig);
	}

	if (
		request.nextUrl.pathname === "/" &&
		hasSessionCookie(request.headers.get("cookie"))
	) {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
