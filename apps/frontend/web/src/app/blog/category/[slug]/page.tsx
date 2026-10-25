import { BlogCta } from "@reloop/web/components/landing/blog/blog-cta";
import { BlogIndex } from "@reloop/web/components/landing/blog/blog-index";
import { withBlurPlaceholders } from "@reloop/web/lib/landing/blog/blur";
import { createBlogCategoryMetadata } from "@reloop/web/lib/landing/blog/seo";
import {
	generateCategoryStaticParams,
	getCategories,
	getCategoryBySlug,
	getPublishedPosts,
} from "@reloop/web/lib/landing/blog/source";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const instant = false;

type PageProps = {
	params: Promise<{ slug: string }>;
};

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { slug } = await params;
	const category = getCategoryBySlug(slug);

	if (!category) {
		return {};
	}

	return createBlogCategoryMetadata(category);
}

export { generateCategoryStaticParams as generateStaticParams };

export default async function BlogCategoryPage({ params }: PageProps) {
	const { slug } = await params;
	const category = getCategoryBySlug(slug);

	if (!category) {
		notFound();
	}

	const posts = await withBlurPlaceholders(getPublishedPosts());

	return (
		<BlogIndex
			posts={posts}
			categories={getCategories()}
			activeCategorySlug={slug}
		>
			<BlogCta category={category.name} />
		</BlogIndex>
	);
}
