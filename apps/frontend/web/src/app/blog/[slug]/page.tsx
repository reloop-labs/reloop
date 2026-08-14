import { JsonLd } from "@reloop/web/components/json-ld";
import { BlogPostPageView } from "@reloop/web/components/landing/blog/blog-post-page-view";
import {
	buildBlogPostJsonLd,
	createBlogPostMetadata,
} from "@reloop/web/lib/landing/blog/seo";
import {
	generateStaticParams,
	getPost,
	getRelatedPosts,
	isPostViewable,
} from "@reloop/web/lib/landing/blog/source";
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

	return createBlogPostMetadata(post);
}

export { generateStaticParams };

export default async function BlogPostPage({ params }: PageProps) {
	const { slug } = await params;
	const post = getPost(slug);

	if (!isPostViewable(post)) {
		notFound();
	}

	const { body: renderBody, ...postData } = post;
	const relatedPosts = getRelatedPosts(slug, 4);

	return (
		<>
			<JsonLd data={buildBlogPostJsonLd(postData)} />
			<BlogPostPageView
				post={postData}
				body={renderBody()}
				toc={post.toc}
				relatedPosts={relatedPosts}
			/>
		</>
	);
}
