import { AGENT_LINK_HEADER } from "@reloop/web/lib/agent-headers";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Better Auth cookiePrefix `reloop` → `reloop.session_token`.
 * On HTTPS the Secure flag names the cookie `__Secure-reloop.session_token`
 * (and occasionally `__Host-…`). Keep this check local so the proxy stays
 * free of workspace package imports (app-local modules are fine).
 */
function hasSessionCookie(cookieHeader: string | null): boolean {
	if (!cookieHeader) return false;
	return /(?:^|;\s*)(?:__Secure-|__Host-)?reloop\.session_token=/.test(
		cookieHeader,
	);
}

/** AI fetchers that read markdown better than HTML, even when they ask for HTML. */
const AI_BOT_UA =
	/GPTBot|ChatGPT-User|OAI-SearchBot|ClaudeBot|Claude-User|Claude-SearchBot|anthropic-ai|PerplexityBot|Perplexity-User|MistralAI-User|DuckAssistBot|cohere-ai/i;

/** `Accept: text/markdown` with a non-zero q value. */
function acceptsMarkdown(accept: string | null): boolean {
	if (!accept) return false;
	return accept.split(",").some((part) => {
		const [type, ...params] = part.trim().split(";");
		if (type?.trim().toLowerCase() !== "text/markdown") return false;
		const q = params.find((p) => p.trim().startsWith("q="));
		return !q || Number(q.trim().slice(2)) > 0;
	});
}

/** Pages only; files (`.md`, `.xml`, images) and app/docs prefixes keep their own handling. */
function isMarketingPage(pathname: string): boolean {
	return (
		!/\.[a-z0-9]+$/i.test(pathname) && !pathname.startsWith("/.well-known")
	);
}

function markdownTwin(pathname: string): string {
	return pathname === "/" ? "/index.md" : `${pathname.replace(/\/$/, "")}.md`;
}

/**
 * Logged-in visitors hitting the marketing homepage should land in the app.
 * Other marketing routes stay reachable so users can still read docs, pricing, etc.
 *
 * Agents get the markdown twin of a page when they send `Accept: text/markdown`,
 * use a known AI user agent, or pass `?mode=agent`.
 */
export function proxy(request: NextRequest) {
	const { pathname, searchParams } = request.nextUrl;

	if (isMarketingPage(pathname)) {
		const wantsMarkdown =
			acceptsMarkdown(request.headers.get("accept")) ||
			AI_BOT_UA.test(request.headers.get("user-agent") ?? "") ||
			searchParams.get("mode") === "agent";

		if (wantsMarkdown) {
			const url = request.nextUrl.clone();
			url.pathname = markdownTwin(pathname);
			url.search = "";
			const response = NextResponse.rewrite(url);
			response.headers.set("Vary", "Accept, User-Agent");
			return response;
		}
	}

	if (pathname === "/" && hasSessionCookie(request.headers.get("cookie"))) {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	const response = NextResponse.next();
	if (isMarketingPage(pathname)) {
		response.headers.set("Vary", "Accept, User-Agent");
		// Replaces the next.config Link header, so carry the agent links along
		response.headers.set(
			"Link",
			`${AGENT_LINK_HEADER}, <${markdownTwin(pathname)}>; rel="alternate"; type="text/markdown"`,
		);
	}
	return response;
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
