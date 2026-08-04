import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/** Agent endpoints with dedicated App Router routes (not content markdown). */
const RESERVED_MARKDOWN_PATHS = new Set([
	"/skill.md",
	"/docs/skill.md",
]);

export function proxy(request: NextRequest) {
	// Exclude our internal API routes and static assets from being intercepted again
	if (
		request.nextUrl.pathname.startsWith("/api/") ||
		request.nextUrl.pathname.startsWith("/_next/") ||
		request.nextUrl.pathname.match(/\.(png|jpg|jpeg|gif|svg|ico)$/)
	) {
		return NextResponse.next();
	}

	const pathname = request.nextUrl.pathname;
	// basePath is /docs; pathname may be /skill.md or /docs/skill.md depending on matcher
	if (
		pathname.endsWith("/skill.md") ||
		pathname === "/skill.md" ||
		RESERVED_MARKDOWN_PATHS.has(pathname)
	) {
		return NextResponse.next();
	}

	const acceptHeader = request.headers.get("accept") || "";
	const isMarkdownAccept = acceptHeader.includes("text/markdown");
	const isMarkdownExtension = pathname.endsWith(".md");

	// If the request explicitly asks for markdown (via header or .md extension)
	if (isMarkdownAccept || isMarkdownExtension) {
		// Remove the .md extension if it exists to get the clean slug
		const cleanPath = pathname.replace(/\.md$/, "");

		// Create the target API URL: /docs/api/markdown/[cleanPath]
		// We explicitly include /docs because Next.js has basePath: '/docs' configured
		const targetUrl = new URL(`/docs/api/markdown${cleanPath}`, request.url);
		return NextResponse.rewrite(targetUrl);
	}

	return NextResponse.next();
}

// Ensure the middleware only runs for page routes, not static files / agent indexes
export const config = {
	matcher: [
		/*
		 * Match all request paths except:
		 * - api, _next/static, _next/image, favicon
		 * - agent index / discovery files (dedicated routes)
		 */
		"/((?!api|_next/static|_next/image|favicon.ico|llms\\.txt|llms-full\\.txt|sitemap\\.md|skill\\.md|mcp|\\.well-known).*)",
	],
};
