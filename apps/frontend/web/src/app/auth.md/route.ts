import { buildAuthMdContent } from "@reloop/web/lib/auth-md";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const hostHeader =
		request.headers.get("x-forwarded-host") || request.headers.get("host");
	const content = buildAuthMdContent(hostHeader);

	return new NextResponse(content, {
		status: 200,
		headers: {
			"Content-Type": "text/markdown; charset=utf-8",
			"Cache-Control": "public, max-age=300, s-maxage=3600, must-revalidate",
			"Content-Signal": "ai-train=yes, search=yes, ai-input=yes",
		},
	});
}
