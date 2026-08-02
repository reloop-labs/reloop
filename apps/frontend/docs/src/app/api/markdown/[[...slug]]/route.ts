import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
	_request: NextRequest,
	props: { params: Promise<{ slug?: string[] }> },
) {
	try {
		const params = await props.params;
		const slug = params.slug?.length ? params.slug : ["introduction"];
		const relativePath = slug.join("/");

		const getDocsDir = (): string => {
			const paths = [
				"/app/content/docs", // Verified production path
				join(process.cwd(), "content/docs"),
				join(process.cwd(), "apps/frontend/docs/content/docs"),
			];
			for (const p of paths) {
				if (existsSync(p)) return p;
			}
			return paths[0]!;
		};

		const docsDir = getDocsDir();
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
	} catch (error: any) {
		console.error("Markdown API Error:", error);
		return new NextResponse(`CRASH: ${error.message}\n${error.stack}`, {
			status: 500,
		});
	}
}
