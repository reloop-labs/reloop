import { glossaryTerms } from "@reloop/web/lib/landing/glossary";
import { getSiteUrl } from "@reloop/web/lib/site";

export type GlossarySitemapEntry = {
	path: string;
	slug: string | null;
	title: string;
	/** 0–1, higher = more important for crawlers */
	priority: number;
	changeFrequency: "weekly" | "monthly";
};

/** Index + every term, sorted A–Z by title (index first). */
export function getGlossarySitemapEntries(): GlossarySitemapEntry[] {
	const terms = [...glossaryTerms].sort((a, b) =>
		a.title.localeCompare(b.title, "en", { sensitivity: "base" }),
	);

	return [
		{
			path: "/glossary",
			slug: null,
			title: "Email Glossary",
			priority: 0.9,
			changeFrequency: "weekly",
		},
		...terms.map((term) => ({
			path: `/glossary/${term.slug}`,
			slug: term.slug,
			title: term.title,
			priority: 0.75,
			changeFrequency: "monthly" as const,
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
 * Build a standalone XML urlset for the email glossary.
 * Served at `/glossary/sitemap.xml`.
 */
export function buildGlossarySitemapXml(
	siteUrl = getSiteUrl(),
	lastModified = new Date(),
): string {
	const origin = siteUrl.replace(/\/$/, "");
	const lastmod = lastModified.toISOString().slice(0, 10);
	const entries = getGlossarySitemapEntries();

	const urls = entries
		.map((entry) => {
			const loc = `${origin}${entry.path}`;
			return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority.toFixed(1)}</priority>
  </url>`;
		})
		.join("\n");

	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}
