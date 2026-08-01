import { buildGlossarySitemapXml } from "@reloop/web/lib/landing/glossary/sitemap";

export const dynamic = "force-static";

export function GET() {
	const xml = buildGlossarySitemapXml();

	return new Response(xml, {
		headers: {
			"Content-Type": "application/xml; charset=utf-8",
			"Cache-Control": "public, max-age=3600, s-maxage=3600",
		},
	});
}
