import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
	// Exclude our internal API routes and static assets from being intercepted again
	if (
		request.nextUrl.pathname.startsWith("/api/") ||
		request.nextUrl.pathname.startsWith("/_next/") ||
		request.nextUrl.pathname.match(/\.(png|jpg|jpeg|gif|svg|ico)$/)
	) {
		return NextResponse.next();
	}

	const acceptHeader = request.headers.get("accept") || "";
	const isMarkdownAccept = acceptHeader.includes("text/markdown");
	const isMarkdownExtension = request.nextUrl.pathname.endsWith(".md");

	// If the request explicitly asks for markdown (via header or .md extension)
	if (isMarkdownAccept || isMarkdownExtension) {
		// Remove the .md extension if it exists to get the clean slug
		const cleanPath = request.nextUrl.pathname.replace(/\.md$/, "");
		
		// Create the target API URL: /docs/api/markdown/[cleanPath]
		// We explicitly include /docs because Next.js has basePath: '/docs' configured
		const targetUrl = new URL(`/docs/api/markdown${cleanPath}`, request.url);
		return NextResponse.rewrite(targetUrl);
	}

	return NextResponse.next();
}

// Ensure the middleware only runs for page routes, not static files
export const config = {
	matcher: [
		// Match all request paths except for the ones starting with:
		// - api (API routes)
		// - _next/static (static files)
		// - _next/image (image optimization files)
		// - favicon.ico (favicon file)
		// - llms.txt (our llms index)
		"/((?!api|_next/static|_next/image|favicon.ico|llms.txt).*)",
	],
};
