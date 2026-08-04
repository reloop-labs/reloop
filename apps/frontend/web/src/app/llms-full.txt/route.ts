import { NextResponse } from "next/server";
import {
	AGENT_CACHE_CONTROL,
	AGENT_CONTENT_SIGNAL,
} from "@reloop/web/lib/agent-headers";
import { loadMarketingCorpus, readWebAppFile } from "@reloop/web/lib/agent-content";
import { getSiteUrl } from "@reloop/web/lib/site";

function buildLiveCorpus(): string {
	const origin = getSiteUrl();
	const pages = loadMarketingCorpus();
	const chunks: string[] = [
		"# Reloop Marketing (full)",
		"",
		"> Full-document snapshot of Reloop marketing site content for long-context agents.",
		`> Site index: ${origin}/llms.txt`,
		`> Product docs corpus: ${origin}/docs/llms-full.txt`,
		`> Product skill: ${origin}/skill.md`,
		"",
		`Generated from ${pages.length} pages.`,
		"",
	];

	for (const page of pages) {
		chunks.push("---", "");
		chunks.push(`# ${page.title}`);
		chunks.push("");
		chunks.push(`Path: ${page.path}`);
		chunks.push(
			`URL: ${origin}${page.path === "/" ? "" : page.path}`,
		);
		chunks.push(
			`Markdown: ${origin}${page.path === "/" ? "/index" : page.path}.md`,
		);
		chunks.push("");
		chunks.push(page.body.slice(0, 80_000));
		chunks.push("");
	}

	return chunks.join("\n");
}

export async function GET() {
	// Prefer prebuilt file when present (build-time), else generate on the fly
	const prebuilt = readWebAppFile("llms-full.txt");
	const content = prebuilt && prebuilt.length > 1000 ? prebuilt : buildLiveCorpus();

	return new NextResponse(content, {
		status: 200,
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"Cache-Control": AGENT_CACHE_CONTROL,
			"Content-Signal": AGENT_CONTENT_SIGNAL,
		},
	});
}
