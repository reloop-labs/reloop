import { AGENT_CACHE_CONTROL } from "@reloop/web/lib/agent-headers";
import { getPublishedPosts } from "@reloop/web/lib/landing/blog/source";
import { getSiteUrl } from "@reloop/web/lib/site";

/** Section llms.txt for the blog, linked from the root llms.txt. */
export function GET() {
	const site = getSiteUrl();
	const posts = getPublishedPosts();

	const body = [
		"# Reloop Blog",
		"",
		"> Guides and engineering notes on email deliverability, SMTP, transactional email and running email infrastructure. Every post has a markdown twin.",
		"",
		`Site index: ${site}/llms.txt`,
		"",
		"## Posts",
		"",
		...posts.map(
			(post) =>
				`- [${post.title}](${site}/blog/${post.slug}.md): ${post.description}`,
		),
		"",
		"## Optional",
		"",
		`- [RSS feed](${site}/blog/feed.xml)`,
		`- [Full marketing corpus](${site}/llms-full.txt)`,
		"",
	].join("\n");

	return new Response(body, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"Cache-Control": AGENT_CACHE_CONTROL,
		},
	});
}
