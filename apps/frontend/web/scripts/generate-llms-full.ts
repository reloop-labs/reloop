/**
 * Build marketing llms-full.txt for long-context agents.
 * Run: bun apps/frontend/web/scripts/generate-llms-full.ts
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadMarketingCorpus } from "../src/lib/agent-content";

const outPath = join(import.meta.dirname, "../llms-full.txt");
const origin = "https://reloop.sh";
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
	chunks.push(`URL: ${origin}${page.path === "/" ? "" : page.path}`);
	chunks.push(
		`Markdown: ${origin}${page.path === "/" ? "/index" : page.path}.md`,
	);
	chunks.push("");
	chunks.push(page.body);
	chunks.push("");
}

const output = chunks.join("\n");
writeFileSync(outPath, output, "utf-8");
console.log(
	`Wrote ${outPath} (${output.length.toLocaleString()} chars, ${pages.length} pages)`,
);
