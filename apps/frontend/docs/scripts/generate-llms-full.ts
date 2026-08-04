/**
 * Build llms-full.txt: a single-file snapshot of docs content for long-context agents.
 * Run: bun apps/frontend/docs/scripts/generate-llms-full.ts
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const docsRoot = join(import.meta.dirname, "../content/docs");
const outPath = join(import.meta.dirname, "../llms-full.txt");

const PRIORITY_PREFIXES = [
	"introduction.mdx",
	"learn/ai/",
	"learn/api-keys.mdx",
	"api/",
	"webhooks/",
	"integrations/ai-tools/",
	"integrations/agent-skills/",
	"resources/",
];

function walk(dir: string, files: string[] = []): string[] {
	for (const name of readdirSync(dir)) {
		if (name === "meta.json" || name.startsWith(".")) continue;
		const full = join(dir, name);
		const st = statSync(full);
		if (st.isDirectory()) {
			walk(full, files);
		} else if (name.endsWith(".md") || name.endsWith(".mdx")) {
			files.push(full);
		}
	}
	return files;
}

function stripFrontmatter(content: string): string {
	if (!content.startsWith("---")) return content;
	const match = content.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
	return match ? content.slice(match[0].length) : content;
}

/** Light cleanup: drop pure-JSX wrapper lines agents cannot use. */
function mdxToAgentMarkdown(content: string): string {
	return stripFrontmatter(content)
		.replace(/^\s*import\s+.*$/gm, "")
		.replace(/^\s*export\s+.*$/gm, "")
		.replace(/\n{3,}/g, "\n\n")
		.trim();
}

function priority(rel: string): number {
	const normalized = rel.replace(/\\/g, "/");
	for (let i = 0; i < PRIORITY_PREFIXES.length; i++) {
		if (normalized.startsWith(PRIORITY_PREFIXES[i]!)) return i;
	}
	return PRIORITY_PREFIXES.length;
}

function main() {
	if (!existsSync(docsRoot)) {
		console.error("content/docs not found:", docsRoot);
		process.exit(1);
	}

	const files = walk(docsRoot).sort((a, b) => {
		const ra = relative(docsRoot, a);
		const rb = relative(docsRoot, b);
		const pa = priority(ra);
		const pb = priority(rb);
		if (pa !== pb) return pa - pb;
		return ra.localeCompare(rb);
	});

	const chunks: string[] = [
		"# Reloop Documentation (full)",
		"",
		"> Full-document snapshot of Reloop docs for long-context agents.",
		"> Curated index: https://reloop.sh/docs/llms.txt",
		"> Prefer per-page markdown: append `.md` to any docs URL under https://reloop.sh/docs/",
		"> Product skill: https://reloop.sh/docs/skill.md",
		"",
		`Generated from ${files.length} source files.`,
		"",
	];

	for (const file of files) {
		const rel = relative(docsRoot, file).replace(/\\/g, "/");
		const raw = readFileSync(file, "utf-8");
		const body = mdxToAgentMarkdown(raw);
		if (!body) continue;

		const urlPath =
			rel
				.replace(/\/index\.mdx?$/, "")
				.replace(/\.mdx?$/, "")
				.replace(/^introduction$/, "") || "introduction";
		const pageUrl =
			urlPath === "introduction"
				? "https://reloop.sh/docs"
				: `https://reloop.sh/docs/${urlPath}`;
		const mdUrl = `${pageUrl === "https://reloop.sh/docs" ? "https://reloop.sh/docs/introduction" : pageUrl}.md`;

		chunks.push("---");
		chunks.push("");
		chunks.push(`# ${rel}`);
		chunks.push("");
		chunks.push(`Source: ${pageUrl}`);
		chunks.push(`Markdown: ${mdUrl}`);
		chunks.push("");
		chunks.push(body);
		chunks.push("");
	}

	const output = chunks.join("\n");
	writeFileSync(outPath, output, "utf-8");
	console.log(
		`Wrote ${outPath} (${output.length.toLocaleString()} chars, ${files.length} files)`,
	);
}

main();
