import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import {
	buildCompareIndexMarkdown,
	buildCompareMarkdown,
	listComparePages,
} from "@reloop/web/lib/compare-content";
import { buildPricingMarkdown } from "@reloop/web/lib/pricing-md";
import { getSiteUrl, siteDescription, siteName } from "@reloop/web/lib/site";
import matter from "gray-matter";
import yaml from "js-yaml";
import { injectMarkdownAgentDirective } from "./agent-directive";

const blogDir = join(process.cwd(), "content", "blog");
const agentContentDir = join(process.cwd(), "content", "agent");

export function readWebAppFile(filename: string): string | null {
	const publicPath = join(process.cwd(), "public", filename);
	if (!existsSync(publicPath)) {
		return null;
	}
	try {
		return readFileSync(publicPath, "utf-8");
	} catch {
		return null;
	}
}

function stripFrontmatter(content: string): string {
	if (!content.startsWith("---")) return content;
	const match = content.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
	return match ? content.slice(match[0].length) : content;
}

function isMdxRuntimeLine(line: string): boolean {
	const trimmed = line.trimStart();
	return trimmed.startsWith("import ") || trimmed.startsWith("export ");
}

function firstHeading(body: string): string | undefined {
	for (const line of body.split("\n")) {
		const trimmed = line.trim();
		if (trimmed.startsWith("# ")) {
			return trimmed.slice(2).trim();
		}
	}
	return undefined;
}

function mdxBody(content: string): string {
	return stripFrontmatter(content)
		.split("\n")
		.filter((line) => !isMdxRuntimeLine(line))
		.join("\n")
		.replace(/\n{3,}/g, "\n\n")
		.trim();
}

type BlogMeta = {
	slug: string;
	title: string;
	description: string;
	publishedAt?: string;
	draft?: boolean;
};

function listBlogPosts(): BlogMeta[] {
	if (!existsSync(blogDir)) return [];

	const includeDrafts = process.env.NODE_ENV === "development";

	return readdirSync(blogDir)
		.filter((f) => f.endsWith(".mdx"))
		.map((file) => {
			const slug = file.endsWith(".mdx") ? file.slice(0, -4) : file;
			const raw = readFileSync(join(blogDir, file), "utf-8");
			const { data } = matter(raw, {
				engines: {
					yaml: (s) => yaml.load(s) as object,
				},
			});
			return {
				slug,
				title: (data.title as string) || slug,
				description: (data.description as string) || "",
				publishedAt: data.publishedAt as string | undefined,
				draft: data.draft === true,
			};
		})
		.filter((p) => includeDrafts || !p.draft);
}

/** Resolve markdown body for a marketing path like `/pricing` or `/blog/foo`. */
export function resolveMarketingMarkdown(path: string): string | null {
	const normalized = path.replace(/\.md$/i, "").replace(/\/+$/, "") || "/";
	const origin = getSiteUrl();

	if (normalized === "/pricing" || normalized === "pricing") {
		return injectMarkdownAgentDirective(buildPricingMarkdown());
	}

	if (normalized === "/compare" || normalized === "compare") {
		return injectMarkdownAgentDirective(buildCompareIndexMarkdown());
	}

	const compareMatch = normalized.match(/^\/?compare\/([^/]+)$/);
	if (compareMatch?.[1]) {
		const md = buildCompareMarkdown(compareMatch[1]);
		if (md) return injectMarkdownAgentDirective(md);
	}

	if (normalized === "/" || normalized === "" || normalized === "/index") {
		const home = readAgentPage("home.md");
		if (home) return injectMarkdownAgentDirective(home);
		return injectMarkdownAgentDirective(buildHomeMarkdown());
	}

	// Static agent pages: content/agent/<slug>.md
	const agentSlug = normalized.replace(/^\//, "").replace(/\//g, "-");
	const agentPage = readAgentPage(`${agentSlug}.md`);
	if (agentPage) {
		return injectMarkdownAgentDirective(agentPage);
	}

	// Blog posts
	const blogMatch = normalized.match(/^\/?blog\/([^/]+)$/);
	if (blogMatch?.[1]) {
		const slug = blogMatch[1];
		const file = join(blogDir, `${slug}.mdx`);
		if (!existsSync(file)) return null;
		const raw = readFileSync(file, "utf-8");
		const { data, content } = matter(raw, {
			engines: {
				yaml: (s) => yaml.load(s) as object,
			},
		});
		if (data.draft === true && process.env.NODE_ENV !== "development") {
			return null;
		}
		const body = mdxBody(content);
		const published =
			data.publishedAt instanceof Date
				? data.publishedAt.toISOString().slice(0, 10)
				: typeof data.publishedAt === "string"
					? data.publishedAt.slice(0, 10)
					: undefined;
		const header = [
			`# ${(data.title as string) || slug}`,
			"",
			data.description ? `> ${data.description}` : "",
			"",
			`Source: ${origin}/blog/${slug}`,
			published ? `Published: ${published}` : "",
			"",
			body,
			"",
		]
			.filter((l) => l !== "")
			.join("\n");
		return injectMarkdownAgentDirective(header);
	}

	// Lightweight stub for other public paths (avoid importing full sitemap graph)
	const title =
		normalized
			.split("/")
			.filter(Boolean)
			.map((p) => p.charAt(0).toUpperCase() + p.slice(1))
			.join(" ") || siteName;

	return injectMarkdownAgentDirective(
		[
			`# ${title}`,
			"",
			"> Marketing page.",
			"",
			`URL: ${origin}${normalized === "/" ? "" : normalized}`,
			`Prefer the HTML page or the curated index at ${origin}/llms.txt.`,
			`Product docs index: ${origin}/llms-docs.txt`,
			"",
		].join("\n"),
	);
}

function readAgentPage(name: string): string | null {
	const p = join(agentContentDir, name);
	if (!existsSync(p)) return null;
	return readFileSync(p, "utf-8");
}

function buildHomeMarkdown(): string {
	return [
		`# ${siteName}`,
		"",
		`> ${siteDescription}`,
		"",
		"## Links",
		"",
		"- Pricing: https://reloop.sh/pricing (markdown: /pricing.md)",
		"- Docs index: https://reloop.sh/llms-docs.txt",
		"- Blog: https://reloop.sh/blog",
		"- Signup: https://reloop.sh/dashboard/signup",
		"- GitHub: https://github.com/reloop-labs/reloop",
		"",
	].join("\n");
}

export type SearchablePage = {
	title: string;
	path: string;
	body: string;
};

/** Load marketing text for MCP search + llms-full generation. */
export function loadMarketingCorpus(): SearchablePage[] {
	const pages: SearchablePage[] = [];

	pages.push({
		title: "Pricing",
		path: "/pricing",
		body: buildPricingMarkdown(),
	});

	pages.push({
		title: "Reloop vs the competition",
		path: "/compare",
		body: buildCompareIndexMarkdown(),
	});

	for (const page of listComparePages()) {
		const body = buildCompareMarkdown(page.slug);
		if (!body) continue;
		pages.push({
			title: page.title,
			path: `/compare/${page.slug}`,
			body,
		});
	}

	const home = readAgentPage("home.md") ?? buildHomeMarkdown();
	pages.push({ title: siteName, path: "/", body: home });

	if (existsSync(agentContentDir)) {
		for (const name of readdirSync(agentContentDir)) {
			if (!name.endsWith(".md")) continue;
			const full = join(agentContentDir, name);
			if (!statSync(full).isFile()) continue;
			const slug = name.endsWith(".md") ? name.slice(0, -3) : name;
			if (slug === "home") continue;
			const body = readFileSync(full, "utf-8");
			pages.push({
				title: firstHeading(body) || slug,
				path: `/${slug}`,
				body,
			});
		}
	}

	for (const post of listBlogPosts()) {
		const file = join(blogDir, `${post.slug}.mdx`);
		if (!existsSync(file)) continue;
		const raw = readFileSync(file, "utf-8");
		const { content } = matter(raw, {
			engines: {
				yaml: (s) => yaml.load(s) as object,
			},
		});
		pages.push({
			title: post.title,
			path: `/blog/${post.slug}`,
			body: `${post.description}\n\n${mdxBody(content)}`,
		});
	}

	return pages;
}
