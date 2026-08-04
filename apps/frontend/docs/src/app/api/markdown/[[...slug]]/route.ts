import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { type NextRequest, NextResponse } from "next/server";
import { injectMarkdownAgentDirective } from "../../../../lib/agent-directive";
import {
	AGENT_CACHE_CONTROL,
	AGENT_CONTENT_SIGNAL,
} from "../../../../lib/agent-headers";
import { getDocsContentDir } from "../../../../lib/docs-content-fs";

/** Paths that have dedicated routes and must not be served as doc pages. */
const RESERVED_MD_SLUGS = new Set(["skill", "llms", "llms-full", "sitemap"]);

export async function GET(
	_request: NextRequest,
	props: { params: Promise<{ slug?: string[] }> },
) {
	try {
		const params = await props.params;
		const slug = params.slug?.length ? params.slug : ["introduction"];
		const relativePath = slug.join("/");

		if (slug.length === 1 && RESERVED_MD_SLUGS.has(slug[0]!)) {
			return new NextResponse(`Reserved path: ${relativePath}`, {
				status: 404,
			});
		}

		const docsDir = getDocsContentDir();
		const candidates = [
			join(docsDir, `${relativePath}.mdx`),
			join(docsDir, relativePath, "index.mdx"),
			// Agent-only plain markdown (e.g. learn/ai/api-keys.md)
			join(docsDir, `${relativePath}.md`),
			join(docsDir, relativePath, "index.md"),
		];

		const filePath = candidates.find((candidate) => existsSync(candidate));

		if (!filePath) {
			return new NextResponse(
				`File not found: ${join(docsDir, `${relativePath}.mdx`)}`,
				{ status: 404 },
			);
		}

		const rawContent = readFileSync(filePath, "utf-8");
		const content = injectMarkdownAgentDirective(rawContent);
		const estimatedTokens = Math.ceil(content.length / 4);

		return new NextResponse(content, {
			status: 200,
			headers: {
				"Content-Type": "text/markdown; charset=utf-8",
				"x-markdown-tokens": estimatedTokens.toString(),
				"Content-Signal": AGENT_CONTENT_SIGNAL,
				"Cache-Control": AGENT_CACHE_CONTROL,
			},
		});
	} catch (error: any) {
		console.error("Markdown API Error:", error);
		return new NextResponse(`CRASH: ${error.message}\n${error.stack}`, {
			status: 500,
		});
	}
}
