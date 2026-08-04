import { type NextRequest, NextResponse } from "next/server";
import { resolveMarketingMarkdown } from "@reloop/web/lib/agent-content";
import {
	AGENT_CACHE_CONTROL,
	AGENT_CONTENT_SIGNAL,
} from "@reloop/web/lib/agent-headers";

const RESERVED = new Set([
	"skill",
	"llms",
	"llms-full",
	"sitemap",
	"pricing", // dedicated route
]);

export async function GET(
	_request: NextRequest,
	props: { params: Promise<{ slug?: string[] }> },
) {
	const params = await props.params;
	const slug = params.slug ?? [];

	if (slug.length === 1 && RESERVED.has(slug[0]!)) {
		return new NextResponse(`Reserved path: ${slug[0]}`, { status: 404 });
	}

	const path =
		slug.length === 0 || (slug.length === 1 && slug[0] === "index")
			? "/"
			: `/${slug.join("/")}`;

	const content = resolveMarketingMarkdown(path);
	if (!content) {
		return new NextResponse(`Markdown not found for ${path}`, { status: 404 });
	}

	return new NextResponse(content, {
		status: 200,
		headers: {
			"Content-Type": "text/markdown; charset=utf-8",
			"Cache-Control": AGENT_CACHE_CONTROL,
			"Content-Signal": AGENT_CONTENT_SIGNAL,
			"x-markdown-tokens": String(Math.ceil(content.length / 4)),
		},
	});
}
