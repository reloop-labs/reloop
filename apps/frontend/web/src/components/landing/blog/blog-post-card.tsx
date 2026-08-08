import { BlogPostCoverImage } from "@reloop/web/components/landing/blog/blog-post-cover-image";
import { formatBlogDateUpper } from "@reloop/web/lib/landing/blog/utils";
import type { BlogPostDefinition } from "@reloop/web/lib/landing/types";
import Link from "next/link";

export function BlogPostCard({ post }: { post: BlogPostDefinition }) {
	const categoryUpper = post.category
		? post.category.toUpperCase()
		: "OPEN SOURCE";
	const dateUpper = formatBlogDateUpper(post.publishedAt);

	return (
		<Link
			href={`/blog/${post.slug}`}
			className="group flex flex-col outline-none focus-visible:ring-2 focus-visible:ring-primary-base focus-visible:ring-offset-2 focus-visible:ring-offset-bg-white-0 dark:focus-visible:ring-offset-black"
		>
			<BlogPostCoverImage
				slug={post.slug}
				image={post.image}
				alt={post.title}
			/>

			<div className="mt-4 flex items-center font-mono text-[12px] uppercase tracking-wider">
				<span className="font-medium text-text-sub-600 dark:text-white/60">
					{categoryUpper}
				</span>
				<span className="mx-2 text-text-sub-600/60 dark:text-white/30">/</span>
				<span className="text-text-sub-600 dark:text-white/50">
					{dateUpper}
				</span>
			</div>

			<h2 className="mt-3 font-semibold text-[18px] text-text-strong-950 leading-snug tracking-tight group-hover:text-primary-base sm:text-[19px] dark:text-white">
				{post.title}
			</h2>

			<p className="mt-2 line-clamp-2 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
				{post.description}
			</p>
		</Link>
	);
}
