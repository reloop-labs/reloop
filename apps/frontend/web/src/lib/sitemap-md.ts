import { changelogReleases } from "@reloop/web/app/changelog/changelog-utils";
import { languages } from "@reloop/web/app/languages/languages";
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
	"/docs/resources/sdks": "SDKs",
	"/features": "Features",
	"/glossary": "Glossary",
	"/languages": "Languages",
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
	const glossary = new Map(
		glossaryTerms.map((term) => [term.slug, term.title]),
	);

	return { posts, categories, releases, langs, glossary };
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

	const languageMatch = path.match(/^\/languages\/([^/]+)$/);
	if (languageMatch?.[1]) {
		const slug = languageMatch[1];
		return {
			path,
			title: lookups.langs.get(slug) ?? humanizeSlug(slug),
			type: "language",
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

	if (path.startsWith("/philosophy/")) {
		return {
			path,
			title: humanizeSlug(path.slice("/philosophy/".length)),
			type: "philosophy",
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
		"Version: 1",
		"",
		`Reloop exposes public marketing content in HTML by default. Documentation under \`/docs\` also provides explicit \`.md\` twins, \`Accept: text/markdown\` negotiation, and [\`llms.txt\`](${origin}/docs/llms.txt) for agents.`,
		"",
		"## Discovery surfaces",
		"",
		`- [\`/sitemap.md\`](${origin}/sitemap.md) — markdown discovery index`,
		`- [\`/sitemap.xml\`](${origin}/sitemap.xml) — XML sitemap for crawlers`,
		`- [\`/glossary/sitemap.xml\`](${origin}/glossary/sitemap.xml) — email glossary terms only`,
		`- [\`/docs/llms.txt\`](${origin}/docs/llms.txt) — curated docs index for agents`,
		`- [\`/docs/sitemap.md\`](${origin}/docs/sitemap.md) — full docs page tree`,
		`- [\`/blog/feed.xml\`](${origin}/blog/feed.xml) — blog RSS feed`,
		"",
		"## Human URLs",
		"",
		`- Home and company: \`${origin}/\`, \`/about\`, \`/pricing\`, \`/contact\`, \`/careers\`, \`/community\`, \`/developers\``,
		`- Features: \`${origin}/features/<slug>\``,
		`- Blog posts: \`${origin}/blog/<slug>\``,
		`- Blog categories: \`${origin}/blog/category/<slug>\``,
		`- Changelog: \`${origin}/changelog/<version>\``,
		`- Languages / SDKs: \`${origin}/languages/<slug>\``,
		`- Comparisons: \`${origin}/compare/<vendor>\``,
		`- Alternatives: \`${origin}/alternatives/<vendor>\``,
		`- Glossary index: \`${origin}/glossary\``,
		`- Glossary terms: \`${origin}/glossary/<term>\``,
		`- Tools: \`${origin}/tools/<slug>\``,
		`- Use cases: \`${origin}/use-cases/<slug>\``,
		`- Philosophy: \`${origin}/philosophy/<slug>\``,
		`- Docs: \`${origin}/docs/<path>\``,
		"",
		"### Indexed public examples",
		"",
	];

	for (const entry of entries) {
		const href = entry.path === "/" ? origin : `${origin}${entry.path}`;
		lines.push(`- [${entry.title}](${href}) (${entry.type})`);
	}

	lines.push(
		"",
		"## Markdown twins",
		"",
		`- Docs pages: \`${origin}/docs/<path>.md\``,
		"- Docs content negotiation: `Accept: text/markdown` on `/docs/*` HTML routes",
		"- Marketing HTML routes do not currently expose `.md` twins",
		"",
		"## Usage",
		"",
		"```bash",
		`curl ${origin}/sitemap.md`,
		`curl ${origin}/sitemap.xml`,
		`curl ${origin}/docs/llms.txt`,
		`curl ${origin}/docs/sitemap.md`,
		`curl ${origin}/blog/feed.xml`,
		`curl ${origin}/docs/api/contacts/post-api-contacts-create.md`,
		`curl -H 'Accept: text/markdown' ${origin}/docs/api/contacts/post-api-contacts-create`,
		"```",
		"",
	);

	return lines.join("\n");
}
