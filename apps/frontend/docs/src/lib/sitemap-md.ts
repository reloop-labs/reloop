import type { PageTreeItem } from "./types";

function asText(value: unknown): string {
	if (typeof value === "string" || typeof value === "number") {
		return String(value);
	}
	return "";
}

/** Normalize page URLs so root/index maps to `/introduction`. */
export function normalizeDocsPageUrl(url: string): string {
	const trimmed = url.replace(/\/+$/, "") || "/";
	if (trimmed === "/" || trimmed === "/." || trimmed === "/introduction") {
		return "/introduction";
	}
	return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

/** Absolute markdown mirror URL for a docs page path. */
export function docsMarkdownUrl(baseUrl: string, pageUrl: string): string {
	const origin = baseUrl.replace(/\/+$/, "");
	const path = normalizeDocsPageUrl(pageUrl);
	return `${origin}/docs${path}.md`;
}

function heading(level: number, title: string): string {
	const safeLevel = Math.min(Math.max(level, 2), 6);
	return `${"#".repeat(safeLevel)} ${title}`;
}

/**
 * Build a semantic markdown sitemap from the docs page tree.
 * Links point at `.md` mirrors for agent consumption (Agent Readability Spec).
 */
export function buildSitemapMarkdown(
	tree: PageTreeItem[],
	baseUrl: string,
): string {
	const lines: string[] = [
		"# Sitemap",
		"",
		"> Semantic map of Reloop documentation. Prefer markdown URLs (append `.md`) for agent consumption. Curated index (web source of truth): [llms-docs.txt](/llms-docs.txt). Site index: [llms.txt](/llms.txt).",
		"",
	];

	const seen = new Set<string>();

	const emitPage = (name: string, url: string) => {
		const href = docsMarkdownUrl(baseUrl, url);
		if (seen.has(href)) return;
		seen.add(href);
		lines.push(`- [${name}](${href})`);
	};

	const walk = (items: PageTreeItem[], depth: number) => {
		for (const item of items) {
			if (item.type === "separator") {
				const title = asText(item.name).trim();
				if (title) {
					lines.push("");
					lines.push(heading(depth, title));
					lines.push("");
				}
				continue;
			}

			if (item.type === "page") {
				const name = asText(item.name).trim() || normalizeDocsPageUrl(item.url);
				emitPage(name, item.url);
				continue;
			}

			if (item.type === "folder") {
				const title = asText(item.name).trim() || item.url;
				lines.push("");
				lines.push(heading(depth, title));
				lines.push("");
				walk(item.children, depth + 1);
			}
		}
	};

	walk(tree, 2);

	// Trim leading blank lines after the intro blockquote
	while (lines.length > 4 && lines[4] === "") {
		lines.splice(4, 1);
	}

	return `${lines.join("\n").trim()}\n`;
}
