import type { ComparisonFeatureRow } from "@reloop/web/app/compare/compare-types";
import { competitorBrands } from "@reloop/web/app/compare/competitor-brands";
import {
	getPostSource,
	getPublishedPosts,
} from "@reloop/web/lib/landing/blog/source";
import type { FaqEntry } from "@reloop/web/lib/schema";

/** One point under "Where X is the better choice", split into its bold lead and the rest. */
export type CompareEdgePoint = {
	lead: string;
	detail: string;
};

/**
 * A /compare/<slug> page built from the "Reloop vs X" blog post, for
 * competitors that don't have a hand-written page under app/compare.
 */
export type BlogComparePage = {
	slug: string;
	competitor: string;
	title: string;
	description: string;
	postSlug: string;
	image?: string;
	publishedAt: string;
	features: ComparisonFeatureRow[];
	competitorEdge: CompareEdgePoint[];
	reloopEdge: CompareEdgePoint[];
	faqs: FaqEntry[];
};

const POST_PREFIX = "reloop-vs-";

/** Slugs that already have a hand-written page under app/compare. */
const dedicatedSlugs = new Set(
	competitorBrands.map((brand) => brand.href.replace("/compare/", "")),
);

/** Drops links, bold, italics and code ticks, keeping the visible text. */
export function stripInlineMarkdown(text: string): string {
	return text
		.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
		.replace(/\*\*([^*]+)\*\*/g, "$1")
		.replace(/(^|\W)_([^_]+)_(?=\W|$)/g, "$1$2")
		.replace(/`([^`]+)`/g, "$1")
		.replace(/\s+/g, " ")
		.trim();
}

/** "Reloop vs Brevo (2026): Pricing..." -> "Brevo" */
function competitorFromTitle(title: string): string {
	return title.match(/^Reloop vs (.+?)(?:\s*\(|:|$)/)?.[1]?.trim() ?? title;
}

/** Lines of the section that starts with `heading`, up to the next `## `. */
function sectionLines(body: string, heading: RegExp): string[] {
	const lines = body.split("\n");
	const start = lines.findIndex((line) => heading.test(line));
	if (start === -1) return [];
	const rest = lines.slice(start + 1);
	const end = rest.findIndex((line) => line.startsWith("## "));
	return end === -1 ? rest : rest.slice(0, end);
}

function splitRow(line: string): string[] {
	return line
		.trim()
		.replace(/^\||\|$/g, "")
		.split("|")
		.map((cell) => stripInlineMarkdown(cell));
}

/** The "30-second comparison" table: | label | Reloop | Competitor |. */
function parseFeatureTable(body: string): ComparisonFeatureRow[] {
	const rows = sectionLines(body, /^## The 30-second comparison/)
		.filter((line) => line.trim().startsWith("|"))
		// Header row and the |---| separator.
		.slice(2);
	return rows.flatMap((line) => {
		const [label, reloop, competitor] = splitRow(line);
		if (!label || reloop === undefined || competitor === undefined) return [];
		return [{ label, reloop, competitor }];
	});
}

/** Bullets under "## Where <name> is the better choice". */
function parseEdge(body: string, heading: RegExp): CompareEdgePoint[] {
	return sectionLines(body, heading)
		.filter((line) => line.startsWith("- "))
		.map((line) => {
			const raw = line.slice(2).trim();
			const bold = raw.match(/^\*\*(.+?)\*\*\s*(.*)$/);
			return bold
				? {
						lead: stripInlineMarkdown(bold[1] ?? ""),
						detail: stripInlineMarkdown(bold[2] ?? ""),
					}
				: { lead: "", detail: stripInlineMarkdown(raw) };
		});
}

function buildPage(postSlug: string): BlogComparePage | null {
	const source = getPostSource(postSlug);
	if (!source) return null;
	const { post, content, faq } = source;
	const competitor = competitorFromTitle(post.title);
	const features = parseFeatureTable(content);
	if (features.length === 0) return null;

	return {
		slug: postSlug.slice(POST_PREFIX.length),
		competitor,
		title: `Reloop vs ${competitor}`,
		description: post.description,
		postSlug,
		image: post.image,
		// gray-matter parses unquoted YAML dates into Date objects despite the string type.
		publishedAt: new Date(post.publishedAt).toISOString().slice(0, 10),
		features,
		competitorEdge: parseEdge(
			content,
			/^## Where (?!Reloop\b).+ is the better choice/,
		),
		reloopEdge: parseEdge(content, /^## Where Reloop is the better choice/),
		faqs: faq.map((item) => ({
			question: stripInlineMarkdown(item.question),
			answer: stripInlineMarkdown(item.answer),
		})),
	};
}

/** Every published "Reloop vs X" post without a hand-written compare page. */
export function listBlogComparePages(): BlogComparePage[] {
	return getPublishedPosts()
		.filter(
			(post) =>
				post.slug.startsWith(POST_PREFIX) &&
				!dedicatedSlugs.has(post.slug.slice(POST_PREFIX.length)),
		)
		.flatMap((post) => buildPage(post.slug) ?? [])
		.sort((a, b) => a.competitor.localeCompare(b.competitor));
}

export function getBlogComparePage(slug: string): BlogComparePage | null {
	if (dedicatedSlugs.has(slug)) return null;
	const post = getPublishedPosts().find(
		(candidate) => candidate.slug === `${POST_PREFIX}${slug}`,
	);
	return post ? buildPage(post.slug) : null;
}
