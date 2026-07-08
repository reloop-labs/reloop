import { BlogPostPageView } from "@reloop/web/components/landing/blog/blog-post-page-view";
import { defaultLandingCta } from "@reloop/web/lib/landing/constants";
import {
	generateStaticParams,
	getPost,
	getRelatedPosts,
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

	if (!post || post.draft) {
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

	if (!post || post.draft) {
		notFound();
	}

	return (
		<BlogPostPageView
			post={post}
			body={post.body()}
			relatedPosts={getRelatedPosts(slug)}
			cta={defaultLandingCta(
				"Ready to try Reloop?",
				"Open-source email infrastructure with a free hosted tier.",
			)}
		/>
	);
}
