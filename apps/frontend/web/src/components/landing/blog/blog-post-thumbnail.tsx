import { BlogPostArt } from "@reloop/web/components/landing/blog/blog-post-art";

export function BlogPostThumbnail({ slug }: { slug: string }) {
	return <BlogPostArt slug={slug} variant="card" />;
}
