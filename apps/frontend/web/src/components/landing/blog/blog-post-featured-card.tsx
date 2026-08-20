import { BlogPostCoverImage } from "@reloop/web/components/landing/blog/blog-post-cover-image";
import { formatBlogDateUpper } from "@reloop/web/lib/landing/blog/utils";
import type { BlogPostDefinition } from "@reloop/web/lib/landing/types";
import Link from "next/link";

export function BlogPostFeaturedCard({ post }: { post: BlogPostDefinition }) {
	const categoryUpper = post.category
		? post.category.toUpperCase()
		: "OPEN SOURCE";
	const dateUpper = formatBlogDateUpper(post.publishedAt);

	return (
		<Link
			href={`/blog/${post.slug}`}
			className="group block overflow-hidden rounded-2xl bg-bg-weak-50/50 p-6 sm:p-8 lg:p-10 dark:bg-white/[0.02]"
		>
			<div className="grid gap-8 lg:grid-cols-12 lg:items-center">
				<div className="flex flex-col justify-center lg:col-span-6">
					<div className="flex items-center font-mono text-[12px] uppercase tracking-wider">
						<span className="font-medium text-text-sub-600 dark:text-white/60">
							{categoryUpper}
						</span>
						<span className="mx-2 text-text-sub-600/60 dark:text-white/30">
							/
						</span>
						<span className="text-text-sub-600 dark:text-white/50">
							{dateUpper}
						</span>
					</div>

					<h1 className="mt-3 font-sans font-semibold text-text-strong-950 text-xl leading-snug tracking-tight sm:text-2xl lg:text-[1.65rem] dark:text-white">
						{post.title}
					</h1>
				</div>

				<div className="overflow-hidden rounded-2xl lg:col-span-6">
					<BlogPostCoverImage
						slug={post.slug}
						image={post.image}
						alt={post.title}
						priority
						variant="card"
					/>
				</div>
			</div>
		</Link>
	);
}
