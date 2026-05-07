import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
	_request: NextRequest,
	props: { params: Promise<{ slug?: string[] }> },
) {
	const params = await props.params;
	const slug = params.slug?.length ? params.slug : ["introduction"];
	const relativePath = slug.join("/");

	// Determine the file path. Could be a direct .mdx file or an index.mdx inside a folder
	const docsDir = join(process.cwd(), "content", "docs");
	let filePath = join(docsDir, `${relativePath}.mdx`);

	if (!existsSync(filePath)) {
		filePath = join(docsDir, relativePath, "index.mdx");
	}

	if (!existsSync(filePath)) {
		return new NextResponse("Markdown content not found.", { status: 404 });
	}

	try {
		const rawContent = readFileSync(filePath, "utf-8");

		// Clean up the frontmatter slightly (optional) to make it cleaner for AI
		// We'll leave it as is for now since frontmatter often has useful metadata like 'title' and 'description'

		// Estimate tokens (roughly 4 characters per token)
		const estimatedTokens = Math.ceil(rawContent.length / 4);

		return new NextResponse(rawContent, {
			status: 200,
			headers: {
				"Content-Type": "text/markdown; charset=utf-8",
				"x-markdown-tokens": estimatedTokens.toString(),
				"Content-Signal": "ai-train=yes, search=yes, ai-input=yes",
				"Cache-Control": "public, max-age=3600, s-maxage=86400",
			},
		});
	} catch {
		return new NextResponse("Error reading markdown file.", { status: 500 });
	}
}
