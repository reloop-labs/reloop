import { buildBlogSitemapXml } from "@reloop/web/lib/landing/blog/sitemap";

export function GET() {
	const xml = buildBlogSitemapXml();

	return new Response(xml, {
		headers: {
			"Content-Type": "application/xml; charset=utf-8",
			"Cache-Control": "public, max-age=3600, s-maxage=3600",
		},
	});
}
