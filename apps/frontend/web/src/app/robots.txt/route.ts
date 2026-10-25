import { getSiteUrl } from "@reloop/web/lib/site";

// Route handler instead of robots.ts: MetadataRoute.Robots can't emit the
// ARD `Agentmap:` directive.
export function GET() {
	const siteUrl = getSiteUrl();

	const body = [
		"User-Agent: *",
		"Allow: /",
		// /home is noindex; it must stay crawlable so Google can see that.
		"Disallow: /preferences/",
		"Disallow: /redirect/",
		"Disallow: /twitter",
		"Disallow: /mcp",
		"",
		`Sitemap: ${siteUrl}/sitemap.xml`,
		`Sitemap: ${siteUrl}/glossary/sitemap.xml`,
		`Sitemap: ${siteUrl}/docs/sitemap.xml`,
		"",
		`Agentmap: ${siteUrl}/.well-known/ard.json`,
		"",
	].join("\n");

	return new Response(body, {
		headers: { "Content-Type": "text/plain; charset=utf-8" },
	});
}
