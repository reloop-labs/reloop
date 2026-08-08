import { BlogBody } from "@reloop/web/components/landing/blog/blog-body";
import { BlogCta } from "@reloop/web/components/landing/blog/blog-cta";
import { BlogPostCoverImage } from "@reloop/web/components/landing/blog/blog-post-cover-image";
import { BlogTableOfContents } from "@reloop/web/components/landing/blog/blog-table-of-contents";
import {
	getCategoryByName,
	getCategoryPath,
} from "@reloop/web/lib/landing/blog/source";
import { formatBlogDate } from "@reloop/web/lib/landing/blog/utils";
import type {
	BlogPostDefinition,
	BlogTocItem,
} from "@reloop/web/lib/landing/types";
import Link from "next/link";
import type { ReactNode } from "react";

export function BlogPostPageView({
	post,
	body,
	toc,
}: {
	post: BlogPostDefinition;
	body: ReactNode;
	toc: BlogTocItem[];
}) {
	const category = getCategoryByName(post.category);
	const showToc = toc.length > 0;

	return (
		<div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col border-stroke-soft-200 border-x pt-6 pb-16 md:max-w-7xl dark:border-white/10">
			<div className="relative mx-auto w-full max-w-[720px] px-6 pt-32 pb-8 md:px-10">
				{showToc ? (
					<div className="pointer-events-none absolute top-0 right-full bottom-0 mr-10 hidden w-max xl:block">
						<BlogTableOfContents
							items={toc}
							className="-translate-y-1/2 pointer-events-auto sticky top-1/2"
						/>
					</div>
				) : null}

				<article>
					<header className="mb-20 text-center">
						<nav className="text-[13px] text-text-sub-600 tracking-wide dark:text-white/45">
							<Link
								href="/blog"
								className="transition-colors hover:text-text-strong-950 dark:hover:text-white"
							>
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

						<p className="mx-auto mt-5 max-w-[540px] text-[15px] text-text-sub-600 italic leading-relaxed dark:text-white/50">
							{post.description}
						</p>
					</header>

					<BlogBody className="mt-2">{body}</BlogBody>
				</article>
			</div>

			<BlogCta category={post.category} />
		</div>
	);
}
