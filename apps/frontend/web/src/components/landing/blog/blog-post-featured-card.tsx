import {
	BlogPostAuthorLine,
	BlogPostMeta,
} from "@reloop/web/components/landing/blog/blog-post-card";
import { BlogPostCoverImage } from "@reloop/web/components/landing/blog/blog-post-cover-image";
import type { BlogPostDefinition } from "@reloop/web/lib/landing/types";
import Link from "next/link";

export function BlogPostFeaturedCard({ post }: { post: BlogPostDefinition }) {
	return (
		<Link
			href={`/blog/${post.slug}`}
			className="group grid items-center gap-8 outline-none focus-visible:ring-2 focus-visible:ring-text-strong-950 focus-visible:ring-offset-4 focus-visible:ring-offset-bg-white-0 lg:grid-cols-[1.15fr_1fr] lg:gap-16 dark:focus-visible:ring-white dark:focus-visible:ring-offset-black"
		>
			<BlogPostCoverImage
				slug={post.slug}
				image={post.image}
				alt={post.title}
				variant="list"
				priority
			/>

			<div>
				<BlogPostMeta post={post} className="sm:text-[15px]" />
				<h2 className="mt-3 font-medium text-[1.6rem] text-text-strong-950 leading-[1.15] tracking-[-0.02em] transition-colors group-hover:text-text-sub-600 sm:text-[1.9rem] lg:text-[2.1rem] dark:text-white dark:group-hover:text-white/70">
					{post.title}
				</h2>
				<div className="mt-5">
					<BlogPostAuthorLine author={post.author} size="md" />
				</div>
			</div>
		</Link>
	);
}
