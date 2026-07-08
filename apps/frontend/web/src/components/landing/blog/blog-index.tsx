"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { BlogPostCard } from "@reloop/web/components/landing/blog/blog-post-card";
import {
	filterBlogPosts,
	getBlogCategories,
} from "@reloop/web/lib/landing/blog/utils";
import type { BlogPostDefinition } from "@reloop/web/lib/landing/types";
import { useMemo, useState } from "react";

function RssIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.75"
			aria-hidden="true"
		>
			<path d="M4 11a9 9 0 0 1 9 9" />
			<path d="M4 4a16 16 0 0 1 16 16" />
			<circle cx="5" cy="19" r="1.5" fill="currentColor" stroke="none" />
		</svg>
	);
}

export function BlogIndex({ posts }: { posts: BlogPostDefinition[] }) {
	const categories = useMemo(() => getBlogCategories(posts), [posts]);
	const [activeCategory, setActiveCategory] = useState("All");
	const [query, setQuery] = useState("");

	const filteredPosts = useMemo(
		() => filterBlogPosts(posts, { category: activeCategory, query }),
		[posts, activeCategory, query],
	);

	return (
		<div className="min-h-screen bg-white dark:bg-black">
			<div className="mx-auto max-w-[1320px] px-4 pt-40 pb-10 sm:px-6 lg:px-8">
				<h1 className="font-serif text-[2.8rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.6rem] lg:text-[4.2rem] dark:text-white">
					Blog
				</h1>

				<div className="mt-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
					<div className="flex flex-wrap gap-1">
						{categories.map((category) => {
							const isActive = category === activeCategory;

							return (
								<button
									key={category}
									type="button"
									onClick={() => setActiveCategory(category)}
									className={cn(
										"rounded-full px-3.5 py-1.5 font-medium text-[14px] transition-colors",
										isActive
											? "bg-bg-weak-50 text-text-strong-950 dark:bg-white/10 dark:text-white"
											: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/55 dark:hover:text-white",
									)}
								>
									{category}
								</button>
							);
						})}
					</div>

					<div className="flex items-center gap-2 self-start lg:self-auto">
						<label className="relative block w-full min-w-[220px] sm:w-[260px]">
							<Icon
								name="search"
								className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-text-soft-400"
								aria-hidden="true"
							/>
							<input
								type="search"
								value={query}
								onChange={(event) => setQuery(event.target.value)}
								placeholder="Search..."
								className="h-10 w-full rounded-full border border-stroke-soft-200 bg-bg-weak-50 pr-4 pl-10 text-[14px] text-text-strong-950 outline-none transition-colors placeholder:text-text-soft-400 focus:border-stroke-sub-300 focus:bg-bg-white-0 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/35 dark:focus:border-white/20 dark:focus:bg-white/[0.06]"
							/>
						</label>
						<a
							href="/blog/feed.xml"
							className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-stroke-soft-200 text-text-sub-600 transition-colors hover:border-stroke-soft-300 hover:text-text-strong-950 dark:border-white/10 dark:text-white/55 dark:hover:border-white/20 dark:hover:text-white"
							aria-label="RSS feed"
						>
							<RssIcon className="size-4" />
						</a>
					</div>
				</div>
			</div>

			<div className="mx-auto max-w-[1320px] px-4 pb-20 sm:px-6 lg:px-8">
				{filteredPosts.length === 0 ? (
					<div className="rounded-2xl border border-dashed border-stroke-soft-200 px-6 py-16 text-center dark:border-white/10">
						<p className="font-semibold text-[17px] text-text-strong-950 dark:text-white">
							No posts found
						</p>
						<p className="mt-2 text-[14px] text-text-sub-600 dark:text-white/50">
							Try another category or search term.
						</p>
					</div>
				) : (
					<div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
						{filteredPosts.map((post) => (
							<BlogPostCard key={post.slug} post={post} />
						))}
					</div>
				)}
			</div>
		</div>
	);
}
