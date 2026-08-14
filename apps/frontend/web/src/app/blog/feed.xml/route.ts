import { statBlogCoverFile } from "@reloop/web/lib/landing/blog/cover";
import { blogCoverAbsoluteUrl } from "@reloop/web/lib/landing/blog/seo";
import { getPublishedPosts } from "@reloop/web/lib/landing/blog/source";
import { getSiteUrl } from "@reloop/web/lib/site";

export async function GET() {
	const siteUrl = getSiteUrl();
	const posts = getPublishedPosts();

	const items = (
		await Promise.all(
			posts.map(async (post) => {
				const url = `${siteUrl}/blog/${post.slug}`;
				const coverUrl = blogCoverAbsoluteUrl(post.image);
				const cover = post.image ? await statBlogCoverFile(post.image) : null;
				const enclosure =
					coverUrl && cover
						? `
      <enclosure url="${coverUrl}" type="${cover.contentType}" length="${cover.byteLength}" />`
						: "";

				return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${url}</link>
      <guid>${url}</guid>
      <description><![CDATA[${post.description}]]></description>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <category><![CDATA[${post.category}]]></category>${enclosure}
    </item>`;
			}),
		)
	).join("");

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
