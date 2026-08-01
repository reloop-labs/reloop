import { buildSitemapMarkdown } from "@reloop/fe-docs/lib/sitemap-md";
import { source } from "@reloop/fe-docs/lib/source";
import type { PageTreeItem } from "@reloop/fe-docs/lib/types";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest) {
	const baseUrl = process.env.NEXT_PUBLIC_URL || "https://reloop.sh";
	const tree = source.pageTree.children as PageTreeItem[];
	const content = buildSitemapMarkdown(tree, baseUrl);

	return new NextResponse(content, {
		status: 200,
		headers: {
			"Content-Type": "text/markdown; charset=utf-8",
			"Cache-Control": "public, max-age=3600, s-maxage=86400",
			"Content-Signal": "ai-train=yes, search=yes, ai-input=yes",
		},
	});
}
