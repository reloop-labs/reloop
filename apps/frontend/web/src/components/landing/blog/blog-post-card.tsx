import { BlogPostCoverImage } from "@reloop/web/components/landing/blog/blog-post-cover-image";
import { formatBlogDate } from "@reloop/web/lib/landing/blog/utils";
import type { BlogPostDefinition } from "@reloop/web/lib/landing/types";
import Link from "next/link";

export function BlogPostCard({ post }: { post: BlogPostDefinition }) {
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
			<h2 className="mt-5 font-semibold text-[18px] text-text-strong-950 leading-snug tracking-tight group-hover:text-primary-base sm:text-[19px] dark:text-white">
				{post.title}
			</h2>
			<p className="mt-2 line-clamp-3 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
				{post.description}
			</p>
			<p className="mt-4 text-[13px] text-text-sub-600 dark:text-white/45">
				{post.author.name}
				<span aria-hidden="true"> · </span>
				<time dateTime={post.publishedAt}>{formatBlogDate(post.publishedAt)}</time>
			</p>
		</Link>
	);
}
