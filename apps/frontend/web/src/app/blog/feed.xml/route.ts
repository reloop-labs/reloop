import { blogPosts } from "@reloop/web/lib/landing/blog";
import { sortBlogPosts } from "@reloop/web/lib/landing/blog/utils";
import { getSiteUrl } from "@reloop/web/lib/site";

export function GET() {
	const siteUrl = getSiteUrl();
	const posts = sortBlogPosts(blogPosts);

	const items = posts
		.map((post) => {
			const url = `${siteUrl}/blog/${post.slug}`;

			return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${url}</link>
      <guid>${url}</guid>
      <description><![CDATA[${post.description}]]></description>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <category><![CDATA[${post.tag}]]></category>
    </item>`;
		})
		.join("");

	const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Reloop Blog</title>
    <link>${siteUrl}/blog</link>
    <description>Guides, tutorials, and engineering notes from Reloop Labs.</description>
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
