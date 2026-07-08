import { BlogPostArt } from "@reloop/web/components/landing/blog/blog-post-art";

export function BlogPostHeroArt({ slug }: { slug: string }) {
	return <BlogPostArt slug={slug} variant="hero" />;
}
