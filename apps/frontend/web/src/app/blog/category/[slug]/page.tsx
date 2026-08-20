import { BlogIndex } from "@reloop/web/components/landing/blog/blog-index";
import { createBlogCategoryMetadata } from "@reloop/web/lib/landing/blog/seo";
import {
	generateCategoryStaticParams,
	getCategories,
	getCategoryBySlug,
	getPostsByCategory,
} from "@reloop/web/lib/landing/blog/source";
import type { Metadata } from "next";
import Link from "next/link";
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

	const posts = getPostsByCategory(slug);

	return (
		<BlogIndex
			posts={posts}
			categories={getCategories()}
			title={category.name}
			description={category.description}
			activeCategorySlug={slug}
			breadcrumb={
				<nav className="mb-4 text-[13px] text-text-sub-600 dark:text-white/55">
					<Link href="/blog" className="hover:text-primary-base">
						Blog
					</Link>
					<span className="mx-2">/</span>
					<span>{category.name}</span>
				</nav>
			}
		/>
	);
}
