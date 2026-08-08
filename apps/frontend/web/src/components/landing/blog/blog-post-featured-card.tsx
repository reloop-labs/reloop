import { BlogPostCoverImage } from "@reloop/web/components/landing/blog/blog-post-cover-image";
import { formatBlogDate } from "@reloop/web/lib/landing/blog/utils";
import type { BlogPostDefinition } from "@reloop/web/lib/landing/types";
import Link from "next/link";

export function BlogPostFeaturedCard({ post }: { post: BlogPostDefinition }) {
	return (
		<Link
			href={`/blog/${post.slug}`}
			className="relative block overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-weak-50/50 p-6 sm:p-8 lg:p-10 dark:border-white/10 dark:bg-white/[0.02]"
		>
			<div className="grid gap-8 lg:grid-cols-12 lg:items-center">
				<div className="flex flex-col justify-center lg:col-span-6">
					{post.category ? (
						<div className="flex items-center gap-2.5">
							<span className="font-medium text-[13px] text-text-sub-600 capitalize dark:text-white/60">
								{post.category}
							</span>
						</div>
					) : null}

					<h1 className="mt-4 font-sans font-semibold text-3xl text-text-strong-950 leading-[1.08] tracking-tighter sm:text-4xl lg:text-[2.6rem] dark:text-white">
						{post.title}
					</h1>

					<p className="mt-4 line-clamp-3 text-[15px] text-text-sub-600 leading-relaxed sm:line-clamp-4 sm:text-[16px] dark:text-white/60">
						{post.description}
					</p>

					<div className="mt-6 border-stroke-soft-200 border-t pt-5 dark:border-white/10">
						<div className="text-[13px] text-text-sub-600 dark:text-white/50">
							<span className="font-medium text-text-strong-950 dark:text-white/80">
								{post.author.name}
							</span>
							<span aria-hidden="true"> · </span>
							<time dateTime={post.publishedAt}>
								{formatBlogDate(post.publishedAt)}
							</time>
							{post.readTime ? (
								<>
									<span aria-hidden="true"> · </span>
									<span>{post.readTime}</span>
								</>
							) : null}
						</div>
					</div>
				</div>

				<div className="overflow-hidden rounded-xl lg:col-span-6">
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
