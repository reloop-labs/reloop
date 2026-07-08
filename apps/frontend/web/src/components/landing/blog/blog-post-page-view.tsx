import * as Button from "@reloop/ui/button";
import { BlogBody } from "@reloop/web/components/landing/blog/blog-body";
import { BlogPostCard } from "@reloop/web/components/landing/blog/blog-post-card";
import { BlogPostCoverImage } from "@reloop/web/components/landing/blog/blog-post-cover-image";
import { BlogTableOfContents } from "@reloop/web/components/landing/blog/blog-table-of-contents";
import { ToolUpsell } from "@reloop/web/components/landing/tools/tool-chrome";
import type { FeatureCtaBand } from "@reloop/web/components/landing/types";
import { formatBlogDate } from "@reloop/web/lib/landing/blog/utils";
import {
	getCategoryByName,
	getCategoryPath,
} from "@reloop/web/lib/landing/blog/source";
import type {
	BlogPostDefinition,
	BlogTocItem,
} from "@reloop/web/lib/landing/types";
import Link from "next/link";
import type { ReactNode } from "react";

export function BlogPostPageView({
	post,
	body,
	relatedPosts,
	toc,
	cta,
}: {
	post: BlogPostDefinition;
	body: ReactNode;
	relatedPosts: BlogPostDefinition[];
	toc: BlogTocItem[];
	cta: FeatureCtaBand;
}) {
	const category = getCategoryByName(post.category);
	const showToc = toc.length > 0;

	return (
		<div className="min-h-screen bg-white dark:bg-black">
			<div className="relative mx-auto w-full max-w-[720px] px-6 py-8 pt-40 md:px-10">
				{showToc ? (
					<div className="pointer-events-none absolute top-0 right-full bottom-0 mr-10 hidden w-44 xl:block">
						<BlogTableOfContents
							items={toc}
							className="pointer-events-auto sticky top-1/2 -translate-y-1/2"
						/>
					</div>
				) : null}

				<article>
				<header className="mb-20 text-center">
					<nav className="text-[13px] text-text-sub-600 tracking-wide dark:text-white/45">
						<Link href="/blog" className="transition-colors hover:text-text-strong-950 dark:hover:text-white">
							Blog
						</Link>
						<span className="mx-2">/</span>
						<Link
							href={category ? getCategoryPath(category.slug) : "/blog"}
							className="transition-colors hover:text-text-strong-950 dark:hover:text-white"
						>
							{post.category}
						</Link>
					</nav>

					<h1 className="mt-8 font-serif text-3xl text-text-strong-950 leading-[1.1] tracking-tighter sm:text-[2.75rem] dark:text-white">
						{post.title}
					</h1>

					<div className="mt-12">
						<BlogPostCoverImage
							slug={post.slug}
							image={post.image}
							alt={post.title}
							priority
							variant="hero"
						/>
					</div>

					<p className="mt-10 text-[14px] text-text-sub-600 dark:text-white/45">
						{post.author.name}
						<span aria-hidden="true"> · </span>
						<time dateTime={post.publishedAt}>
							{formatBlogDate(post.publishedAt)}
						</time>
					</p>

					<p className="mx-auto mt-5 max-w-[540px] text-[15px] text-text-sub-600 leading-relaxed italic dark:text-white/50">
						{post.description}
					</p>
				</header>

				<BlogBody className="mt-2">{body}</BlogBody>

				{relatedPosts.length > 0 ? (
					<section className="mt-16 border-stroke-soft-200 border-t pt-12 dark:border-white/10">
						<h2 className="font-semibold text-2xl text-text-strong-950 tracking-tight dark:text-white">
							Related posts
						</h2>
						<div className="mt-8 grid gap-8 sm:grid-cols-2">
							{relatedPosts.map((relatedPost) => (
								<BlogPostCard key={relatedPost.slug} post={relatedPost} />
							))}
						</div>
					</section>
				) : null}

				<div className="mt-12 border-stroke-soft-200 border-t pt-8 dark:border-white/10">
					<Link
						href="/blog"
						className={Button.buttonVariants({
							mode: "stroke",
							variant: "neutral",
						}).root({
							className: "rounded-full",
						})}
					>
						← All posts
					</Link>
				</div>
				</article>
			</div>

			<ToolUpsell
				title={cta.title}
				description={cta.description}
				primaryHref={cta.primary.href}
				primaryLabel={cta.primary.label}
				secondaryHref={cta.secondary?.href}
				secondaryLabel={cta.secondary?.label}
			/>
		</div>
	);
}
