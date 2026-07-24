import { buildPublicDiscoveryMarkdown } from "@reloop/web/lib/sitemap-md";
import { NextResponse } from "next/server";

export async function GET() {
	const content = buildPublicDiscoveryMarkdown();

	return new NextResponse(content, {
		status: 200,
		headers: {
			"Content-Type": "text/markdown; charset=utf-8",
			"Cache-Control": "public, max-age=3600, s-maxage=86400",
			"Content-Signal": "ai-train=yes, search=yes, ai-input=yes",
		},
	});
}
