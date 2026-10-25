import { cn } from "@reloop/ui/cn";
import { BlogPostCoverImage } from "@reloop/web/components/landing/blog/blog-post-cover-image";
import { formatBlogDateLong } from "@reloop/web/lib/landing/blog/utils";
import type {
	BlogPostAuthor,
	BlogPostDefinition,
} from "@reloop/web/lib/landing/types";
import Image from "next/image";
import Link from "next/link";

export function BlogPostMeta({
	post,
	className,
}: {
	post: BlogPostDefinition;
	className?: string;
}) {
	return (
		<p
			className={cn(
				"flex items-center text-[13.5px] text-text-strong-950 dark:text-white/85",
				className,
			)}
		>
			<time dateTime={post.publishedAt}>
				{formatBlogDateLong(post.publishedAt)}
			</time>
			<span
				className="mx-2 text-text-soft-400 dark:text-white/35"
				aria-hidden="true"
			>
				·
			</span>
			<span>{post.category}</span>
		</p>
	);
}

export function BlogPostAuthorLine({
	author,
	size = "sm",
}: {
	author: BlogPostAuthor;
	size?: "sm" | "md";
}) {
	const avatarSize = size === "md" ? 24 : 20;

	return (
		<span className="flex items-center gap-2 text-text-sub-600 dark:text-white/55">
			{author.avatar ? (
				<Image
					src={author.avatar}
					alt=""
					width={avatarSize}
					height={avatarSize}
					className="rounded-full ring-1 ring-stroke-soft-200 dark:ring-white/15"
				/>
			) : (
				<span
					className="grid place-items-center rounded-full bg-bg-weak-50 font-medium text-[11px] text-text-sub-600 ring-1 ring-stroke-soft-200 dark:bg-white/10 dark:text-white/70 dark:ring-white/15"
					style={{ width: avatarSize, height: avatarSize }}
					aria-hidden="true"
				>
					{author.name.charAt(0)}
				</span>
			)}
			<span className={size === "md" ? "text-[15px]" : "text-[13.5px]"}>
				{author.name}
			</span>
		</span>
	);
}

export function BlogPostCard({ post }: { post: BlogPostDefinition }) {
	return (
		<Link
			href={`/blog/${post.slug}`}
			className="group flex h-full flex-col px-4 py-12 outline-none transition-colors duration-200 hover:bg-bg-weak-50 focus-visible:bg-bg-weak-50 sm:px-8 sm:py-14 lg:px-12 lg:py-16 dark:focus-visible:bg-white/[0.04] dark:hover:bg-white/[0.04]"
		>
			<BlogPostCoverImage
				slug={post.slug}
				image={post.image}
				blurDataURL={post.imageBlurDataURL}
				alt={post.title}
				variant="list"
			/>

			<BlogPostMeta post={post} className="mt-5" />

			<h2 className="mt-2 text-[17px] text-text-strong-950 leading-[1.45] tracking-[-0.01em] transition-colors dark:text-white">
				{post.title}
			</h2>

			<div className="mt-3">
				<BlogPostAuthorLine author={post.author} />
			</div>
		</Link>
	);
}

/** Posts in bordered cells; the lines meet the page frame like a table. */
export function BlogPostGrid({ posts }: { posts: BlogPostDefinition[] }) {
	return (
		<ul className="grid sm:grid-cols-2 lg:grid-cols-3">
			{posts.map((post) => (
				<li
					key={post.slug}
					className="border-stroke-soft-100 border-b sm:border-r dark:border-white/10 sm:max-lg:[&:nth-child(2n)]:border-r-0 lg:[&:nth-child(3n)]:border-r-0"
				>
					<BlogPostCard post={post} />
				</li>
			))}
		</ul>
	);
}
