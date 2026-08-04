import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/** Resolve the content/docs directory across local and container layouts. */
export function getDocsContentDir(): string {
	const paths = [
		"/app/content/docs",
		join(process.cwd(), "content/docs"),
		join(process.cwd(), "apps/frontend/docs/content/docs"),
	];
	for (const p of paths) {
		if (existsSync(p)) return p;
	}
	return paths[1]!;
}

export type DocsTextFile = {
	/** URL path without /docs prefix, e.g. /learn/api-keys */
	urlPath: string;
	/** relative path under content/docs */
	relPath: string;
	title: string;
	body: string;
};

function stripFrontmatter(content: string): {
	title?: string;
	body: string;
} {
	if (!content.startsWith("---")) return { body: content };
	const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
	if (!match) return { body: content };
	const fm = match[1] ?? "";
	const body = match[2] ?? "";
	const titleMatch = fm.match(/^title:\s*["']?(.+?)["']?\s*$/m);
	return {
		title: titleMatch?.[1]?.trim(),
		body,
	};
}

function walk(dir: string, base: string, out: string[] = []): string[] {
	for (const name of readdirSync(dir)) {
		if (name === "meta.json" || name.startsWith(".")) continue;
		const full = join(dir, name);
		const st = statSync(full);
		if (st.isDirectory()) walk(full, base, out);
		else if (name.endsWith(".md") || name.endsWith(".mdx")) out.push(full);
	}
	return out;
}

/** Load all docs pages as plain text for search / MCP. */
export function loadAllDocsText(): DocsTextFile[] {
	const root = getDocsContentDir();
	if (!existsSync(root)) return [];

	const files = walk(root, root);
	const pages: DocsTextFile[] = [];

	for (const file of files) {
		const rel = file.slice(root.length).replace(/^\//, "").replace(/\\/g, "/");
		const raw = readFileSync(file, "utf-8");
		const { title, body } = stripFrontmatter(raw);
		let slug = rel
			.replace(/\/index\.mdx?$/, "")
			.replace(/\.mdx?$/, "")
			.replace(/\\/g, "/");
		if (slug === "introduction" || slug === "") slug = "introduction";
		const normalized = `/${slug}`;

		pages.push({
			urlPath: normalized,
			relPath: rel,
			title: title || rel,
			body: body.slice(0, 50_000),
		});
	}

	return pages;
}
