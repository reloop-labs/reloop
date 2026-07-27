import { changelogReleases } from "@reloop/web/app/changelog/changelog-utils";
import { getSiteUrl } from "@reloop/web/lib/site";

export function GET() {
	const siteUrl = getSiteUrl();

	const items = changelogReleases
		.map((release) => {
			const url = `${siteUrl}/changelog/${release.version}`;

			return `
    <item>
      <title><![CDATA[${release.title}]]></title>
      <link>${url}</link>
      <guid>${url}</guid>
      <description><![CDATA[${release.description}]]></description>
      <pubDate>${new Date(release.date).toUTCString()}</pubDate>
      <category><![CDATA[${release.version}]]></category>
    </item>`;
		})
		.join("");

	const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Reloop Changelog</title>
    <link>${siteUrl}/changelog</link>
    <description>All the latest updates, improvements, and fixes to Reloop.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}
  </channel>
</rss>`;

	return new Response(feed, {
		headers: {
			"Content-Type": "application/rss+xml; charset=utf-8",
			"Cache-Control": "public, max-age=3600, s-maxage=3600",
		},
	});
}
