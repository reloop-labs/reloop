import { getSiteUrl } from "@reloop/web/lib/site";

/** NLWeb Schema Feeds map: where agents fetch the site's structured data in bulk. */
export function GET() {
	const site = getSiteUrl();
	const feeds: Array<[string, string]> = [
		[`${site}/schema/site.jsonl`, "structuredData/schema.org"],
		[`${site}/blog/feed.xml`, "structuredData/rss"],
		[`${site}/changelog/feed.xml`, "structuredData/rss"],
	];

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:sf="http://schema.org/schemas/schemafeed/0.1">
${feeds
	.map(
		([loc, type]) => `  <url>
    <loc>${loc}</loc>
    <sf:contentType>${type}</sf:contentType>
  </url>`,
	)
	.join("\n")}
</urlset>
`;

	return new Response(body, {
		headers: {
			"Content-Type": "application/xml; charset=utf-8",
			"Cache-Control": "public, max-age=300, s-maxage=3600",
		},
	});
}
