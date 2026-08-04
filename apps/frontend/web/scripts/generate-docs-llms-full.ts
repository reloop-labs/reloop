/**
 * Build web/public/llms-full-docs.txt from docs MDX sources.
 * Source of truth for agent discovery lives on the marketing web app only.
 * Run: bun apps/frontend/web/scripts/generate-docs-llms-full.ts
 */
import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { join, relative } from "node:path";

const webRoot = join(import.meta.dirname, "..");
const docsRootCandidates = [
	join(webRoot, "../docs/content/docs"),
	join(webRoot, "../../docs/content/docs"),
	join(process.cwd(), "apps/frontend/docs/content/docs"),
	join(process.cwd(), "content/docs"),
];
const docsRoot = docsRootCandidates.find((p) => existsSync(p));
const publicDir = join(webRoot, "public");
const outPath = join(publicDir, "llms-full-docs.txt");

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
		if (st.isDirectory()) walk(full, files);
		else if (name.endsWith(".md") || name.endsWith(".mdx")) files.push(full);
	}
	return files;
}

function stripFrontmatter(content: string): string {
	if (!content.startsWith("---")) return content;
	const match = content.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
	return match ? content.slice(match[0].length) : content;
}

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
	if (!docsRoot) {
		console.error("docs content not found; tried:", docsRootCandidates);
		process.exit(1);
	}

	mkdirSync(publicDir, { recursive: true });

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
		"> Hosted on the marketing web app (source of truth for agent files).",
		"> Curated docs index: https://reloop.sh/llms-docs.txt",
		"> Site index: https://reloop.sh/llms.txt",
		"> Product skill: https://reloop.sh/skill.md",
		"> Prefer per-page markdown: append `.md` under https://reloop.sh/docs/",
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

		chunks.push(
			"---",
			"",
			`# ${rel}`,
			"",
			`Source: ${pageUrl}`,
			`Markdown: ${mdUrl}`,
			"",
			body,
			"",
		);
	}

	const output = chunks.join("\n");
	writeFileSync(outPath, output, "utf-8");
	console.log(
		`Wrote ${outPath} (${output.length.toLocaleString()} chars, ${files.length} files)`,
	);
}

main();
