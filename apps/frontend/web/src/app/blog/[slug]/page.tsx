import { BlogPostPageView } from "@reloop/web/components/landing/blog/blog-post-page-view";
import {
	generateStaticParams,
	getPost,
	getRelatedPosts,
	isPostViewable,
} from "@reloop/web/lib/landing/blog/source";
import { createLandingMetadata } from "@reloop/web/lib/landing/metadata";
import { notFound } from "next/navigation";

export const instant = false;

type PageProps = {
	params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
	const { slug } = await params;
	const post = getPost(slug);

	if (!isPostViewable(post)) {
		return {};
	}

	return createLandingMetadata(
		post.title,
		post.description,
		`/blog/${post.slug}`,
		post.keywords,
	);
}

export { generateStaticParams };

export default async function BlogPostPage({ params }: PageProps) {
	const { slug } = await params;
	const post = getPost(slug);

	if (!isPostViewable(post)) {
		notFound();
	}

	return (
		<BlogPostPageView
			post={post}
			body={post.body()}
			toc={post.toc}
			relatedPosts={getRelatedPosts(slug)}
		/>
	);
}
