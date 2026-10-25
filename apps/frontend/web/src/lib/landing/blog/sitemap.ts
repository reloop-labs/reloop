import {
	getAllPosts,
	getCategories,
} from "@reloop/web/lib/landing/blog/source";
import { getSiteUrl } from "@reloop/web/lib/site";

export type BlogSitemapEntry = {
	path: string;
	/** YYYY-MM-DD */
	lastmod: string | null;
	/** 0–1, higher = more important for crawlers */
	priority: number;
	changeFrequency: "weekly" | "monthly";
	image?: { path: string; title: string };
};

function toDay(date: string): string | null {
	const parsed = new Date(date);
	return Number.isNaN(parsed.getTime())
		? null
		: parsed.toISOString().slice(0, 10);
}

/**
 * Blog index, each category with posts, then every post newest first.
 * Drafts are always left out, including in development.
 */
export function getBlogSitemapEntries(): BlogSitemapEntry[] {
	const posts = getAllPosts().filter((post) => !post.draft);
	const newest = (list: typeof posts) =>
		list[0] ? toDay(list[0].publishedAt) : null;

	const categories = getCategories()
		.map((category) => ({
			category,
			posts: posts.filter((post) => post.category === category.name),
		}))
		.filter(({ posts: inCategory }) => inCategory.length > 0);

	return [
		{
			path: "/blog",
			lastmod: newest(posts),
			priority: 0.8,
			changeFrequency: "weekly",
		},
		...categories.map(({ category, posts: inCategory }) => ({
			path: `/blog/category/${category.slug}`,
			lastmod: newest(inCategory),
			priority: 0.6,
			changeFrequency: "weekly" as const,
		})),
		...posts.map((post) => ({
			path: `/blog/${post.slug}`,
			lastmod: toDay(post.publishedAt),
			priority: 0.7,
			changeFrequency: "monthly" as const,
			...(post.image ? { image: { path: post.image, title: post.title } } : {}),
		})),
	];
}

function escapeXml(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&apos;");
}

/**
 * Build a standalone XML urlset for the blog, with each post's cover in the
 * image sitemap extension. Served at `/blog/sitemap.xml`.
 */
export function buildBlogSitemapXml(siteUrl = getSiteUrl()): string {
	const origin = siteUrl.replace(/\/$/, "");

	const urls = getBlogSitemapEntries()
		.map((entry) => {
			const lines = [
				`    <loc>${escapeXml(`${origin}${entry.path}`)}</loc>`,
				entry.lastmod ? `    <lastmod>${entry.lastmod}</lastmod>` : null,
				`    <changefreq>${entry.changeFrequency}</changefreq>`,
				`    <priority>${entry.priority.toFixed(1)}</priority>`,
				entry.image
					? `    <image:image>
      <image:loc>${escapeXml(
				entry.image.path.startsWith("http")
					? entry.image.path
					: `${origin}${entry.image.path}`,
			)}</image:loc>
      <image:title>${escapeXml(entry.image.title)}</image:title>
    </image:image>`
					: null,
			].filter(Boolean);
			return `  <url>\n${lines.join("\n")}\n  </url>`;
		})
		.join("\n");

	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>
`;
}
