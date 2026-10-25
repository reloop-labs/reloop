import { homeSchema } from "@reloop/web/lib/home-schema";
import { buildBlogPostJsonLd } from "@reloop/web/lib/landing/blog/seo";
import { getPublishedPosts } from "@reloop/web/lib/landing/blog/source";

/** Schema Feed (JSON Lines): the same schema.org objects the pages embed, one per line. */
export function GET() {
	const posts = getPublishedPosts().map((post) => ({
		"@context": "https://schema.org",
		...buildBlogPostJsonLd(post)["@graph"][0],
	}));

	const body = `${[...homeSchema, ...posts]
		.map((item) => JSON.stringify(item))
		.join("\n")}\n`;

	return new Response(body, {
		headers: {
			"Content-Type": "application/jsonl; charset=utf-8",
			"Cache-Control": "public, max-age=300, s-maxage=3600",
		},
	});
}
