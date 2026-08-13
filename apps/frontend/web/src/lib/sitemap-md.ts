import { changelogReleases } from "@reloop/web/app/changelog/changelog-utils";
import { frameworks } from "@reloop/web/app/sdk/frameworks";
import { languages } from "@reloop/web/app/sdk/languages";
import {
	getCategories,
	getPublishedPosts,
} from "@reloop/web/lib/landing/blog/source";
import { glossaryTerms } from "@reloop/web/lib/landing/glossary";
import { getSiteUrl } from "@reloop/web/lib/site";
import { getAllSitemapRoutes } from "@reloop/web/lib/sitemap-routes";

export type SitemapEntry = {
	path: string;
	title: string;
	type: string;
};

const STATIC_TITLES: Record<string, string> = {
	"/": "Home",
	"/about": "About",
	"/alternatives": "Alternatives",
	"/blog": "Blog",
	"/careers": "Careers",
	"/changelog": "Changelog",
	"/community": "Community",
	"/compare": "Compare",
	"/contact": "Contact",
	"/developers": "Developers",
	"/docs/resources/sdks": "SDKs Docs",
	"/features": "Features",
	"/frameworks": "Frameworks",
	"/glossary": "Glossary",
	"/sdk": "SDK",
	"/license": "License",
	"/pricing": "Pricing",
	"/privacy": "Privacy Policy",
	"/terms-and-conditions": "Terms of Service",
	"/tools": "Tools",
	"/use-cases": "Use cases",
};

function humanizeSlug(slug: string): string {
	return slug
		.split("-")
		.filter(Boolean)
		.map((part) => {
			if (part.toLowerCase() === "ai") return "AI";
			if (part.toLowerCase() === "smtp") return "SMTP";
			if (part.toLowerCase() === "sdk" || part.toLowerCase() === "sdks") {
				return part.toUpperCase();
			}
			if (part.toLowerCase() === "api") return "API";
			return part.charAt(0).toUpperCase() + part.slice(1);
		})
		.join(" ");
}

function buildLookups() {
	const posts = new Map(
		getPublishedPosts().map((post) => [post.slug, post.title]),
	);
	const categories = new Map(
		getCategories().map((category) => [category.slug, category.name]),
	);
	const releases = new Map(
		changelogReleases.map((release) => [
			release.version,
			`${release.version} — ${release.title}`,
		]),
	);
	const langs = new Map<string, string>(
		languages.map((lang) => [lang.slug, lang.name]),
	);
	const fws = new Map<string, string>(
		frameworks.map((fw) => [fw.slug, fw.name]),
	);
	const glossary = new Map(
		glossaryTerms.map((term) => [term.slug, term.title]),
	);

	return { posts, categories, releases, langs, fws, glossary };
}

function classifyRoute(
	path: string,
	lookups: ReturnType<typeof buildLookups>,
): SitemapEntry {
	if (STATIC_TITLES[path]) {
		return { path, title: STATIC_TITLES[path], type: "page" };
	}

	const blogMatch = path.match(/^\/blog\/([^/]+)$/);
	if (blogMatch?.[1]) {
		const slug = blogMatch[1];
		return {
			path,
			title: lookups.posts.get(slug) ?? humanizeSlug(slug),
			type: "post",
		};
	}

	const categoryMatch = path.match(/^\/blog\/category\/([^/]+)$/);
	if (categoryMatch?.[1]) {
		const slug = categoryMatch[1];
		return {
			path,
			title: lookups.categories.get(slug) ?? humanizeSlug(slug),
			type: "list",
		};
	}

	const changelogMatch = path.match(/^\/changelog\/([^/]+)$/);
	if (changelogMatch?.[1]) {
		const version = changelogMatch[1];
		return {
			path,
			title: lookups.releases.get(version) ?? `Changelog ${version}`,
			type: "changelog",
		};
	}

	const languageMatch = path.match(/^\/sdk\/([^/]+)$/);
	if (languageMatch?.[1]) {
		const slug = languageMatch[1];
		return {
			path,
			title: lookups.langs.get(slug) ?? humanizeSlug(slug),
			type: "sdk",
		};
	}

	const frameworkMatch = path.match(/^\/frameworks\/([^/]+)$/);
	if (frameworkMatch?.[1]) {
		const slug = frameworkMatch[1];
		return {
			path,
			title: lookups.fws.get(slug) ?? humanizeSlug(slug),
			type: "framework",
		};
	}

	const glossaryMatch = path.match(/^\/glossary\/([^/]+)$/);
	if (glossaryMatch?.[1]) {
		const slug = glossaryMatch[1];
		return {
			path,
			title: lookups.glossary.get(slug) ?? humanizeSlug(slug),
			type: "glossary-entry",
		};
	}

	if (path.startsWith("/features/")) {
		return {
			path,
			title: humanizeSlug(path.slice("/features/".length)),
			type: "feature",
		};
	}

	if (path.startsWith("/compare/")) {
		return {
			path,
			title: `Reloop vs ${humanizeSlug(path.slice("/compare/".length))}`,
			type: "compare",
		};
	}

	if (path.startsWith("/alternatives/")) {
		return {
			path,
			title: `${humanizeSlug(path.slice("/alternatives/".length))} alternative`,
			type: "alternative",
		};
	}

	if (path.startsWith("/tools/")) {
		return {
			path,
			title: humanizeSlug(path.slice("/tools/".length)),
			type: "tool",
		};
	}

	if (path.startsWith("/use-cases/")) {
		return {
			path,
			title: humanizeSlug(path.slice("/use-cases/".length)),
			type: "use-case",
		};
	}

	const leaf = path.split("/").filter(Boolean).at(-1) ?? path;
	return { path, title: humanizeSlug(leaf), type: "page" };
}

/** All public marketing entries for the markdown discovery index. */
export function getSitemapEntries(): SitemapEntry[] {
	const lookups = buildLookups();
	return getAllSitemapRoutes()
		.map((path) => classifyRoute(path, lookups))
		.sort((a, b) => a.path.localeCompare(b.path));
}

/**
 * AI Hero–style public discovery document.
 * @see https://www.aihero.dev/sitemap.md
 */
export function buildPublicDiscoveryMarkdown(
	siteUrl = getSiteUrl(),
	entries = getSitemapEntries(),
): string {
	const origin = siteUrl.replace(/\/$/, "");

	const lines: string[] = [
		"# Reloop Public Discovery",
		"",
		"Version: 2",
		"",
		`> For the complete documentation index, see [llms.txt](${origin}/llms.txt). Docs index: [llms-docs.txt](${origin}/llms-docs.txt). Full corpora: [llms-full.txt](${origin}/llms-full.txt), [llms-full-docs.txt](${origin}/llms-full-docs.txt).`,
		"",
		"Reloop exposes public marketing content in HTML and markdown. Agent discovery files are hosted on the marketing web app. Documentation under `/docs` provides `.md` twins and `Accept: text/markdown` negotiation.",
		"",
		"## Discovery surfaces",
		"",
		`- [\`/llms.txt\`](${origin}/llms.txt) — site entry index (web source of truth)`,
		`- [\`/llms-docs.txt\`](${origin}/llms-docs.txt) — curated product docs index`,
		`- [\`/llms-full.txt\`](${origin}/llms-full.txt) — marketing + blog full corpus`,
		`- [\`/llms-full-docs.txt\`](${origin}/llms-full-docs.txt) — full docs corpus`,
		`- [\`/skill.md\`](${origin}/skill.md) — product skill for agents`,
		`- [\`/pricing.md\`](${origin}/pricing.md) — structured pricing`,
		`- [\`/mcp\`](${origin}/mcp) — site search MCP`,
		`- [\`/.well-known/mcp.json\`](${origin}/.well-known/mcp.json) — MCP discovery`,
		`- [\`/sitemap.md\`](${origin}/sitemap.md) — markdown discovery index`,
		`- [\`/sitemap.xml\`](${origin}/sitemap.xml) — XML sitemap for crawlers`,
		`- [\`/glossary/sitemap.xml\`](${origin}/glossary/sitemap.xml) — email glossary terms only`,
		`- [\`/docs/sitemap.md\`](${origin}/docs/sitemap.md) — full docs page tree`,
		`- [\`/docs/mcp\`](${origin}/docs/mcp) — docs search MCP (runtime)`,
		`- [\`/blog/feed.xml\`](${origin}/blog/feed.xml) — blog RSS feed`,
		"",
		"## Human URLs",
		"",
		`- Home and company: \`${origin}/\`, \`/about\`, \`/pricing\`, \`/contact\`, \`/careers\`, \`/community\`, \`/developers\``,
		`- Features: \`${origin}/features/<slug>\``,
		`- Blog posts: \`${origin}/blog/<slug>\``,
		`- Blog categories: \`${origin}/blog/category/<slug>\``,
		`- Changelog: \`${origin}/changelog/<version>\``,
		`- SDKs: \`${origin}/sdk/<slug>\``,
		`- Frameworks: \`${origin}/frameworks/<slug>\``,
		`- Comparisons: \`${origin}/compare/<vendor>\``,
		`- Alternatives: \`${origin}/alternatives/<vendor>\``,
		`- Glossary index: \`${origin}/glossary\``,
		`- Glossary terms: \`${origin}/glossary/<term>\``,
		`- Tools: \`${origin}/tools/<slug>\``,
		`- Use cases: \`${origin}/use-cases/<slug>\``,
		`- Docs: \`${origin}/docs/<path>\``,
		"",
		"### Indexed public examples",
		"",
	];

	for (const entry of entries) {
		const href = entry.path === "/" ? origin : `${origin}${entry.path}`;
		const mdPath =
			entry.path === "/" ? `${origin}/index.md` : `${origin}${entry.path}.md`;
		lines.push(`- [${entry.title}](${href}) (${entry.type}) — [md](${mdPath})`);
	}

	lines.push(
		"",
		"## Markdown twins",
		"",
		`- Site index pages: \`${origin}/index.md\`, \`${origin}/about.md\`, \`${origin}/developers.md\`, \`${origin}/pricing.md\``,
		`- Blog posts: \`${origin}/blog/<slug>.md\``,
		`- Docs pages: \`${origin}/docs/<path>.md\``,
		"- Docs content negotiation: `Accept: text/markdown` on `/docs/*` HTML routes",
		"",
		"## Usage",
		"",
		"```bash",
		`curl ${origin}/llms.txt`,
		`curl ${origin}/llms-docs.txt`,
		`curl ${origin}/llms-full.txt`,
		`curl ${origin}/llms-full-docs.txt`,
		`curl ${origin}/skill.md`,
		`curl ${origin}/pricing.md`,
		`curl ${origin}/sitemap.md`,
		`curl ${origin}/docs/learn/ai/api-keys.md`,
		"```",
		"",
	);

	return lines.join("\n");
}
