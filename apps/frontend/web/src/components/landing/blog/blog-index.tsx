"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { BlogPostGrid } from "@reloop/web/components/landing/blog/blog-post-card";
import { BlogPostFeaturedCard } from "@reloop/web/components/landing/blog/blog-post-featured-card";
import {
	filterBlogPosts,
	sortBlogPosts,
} from "@reloop/web/lib/landing/blog/utils";
import type {
	BlogCategoryDefinition,
	BlogPostDefinition,
} from "@reloop/web/lib/landing/types";
import Link from "next/link";
import {
	type ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";

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

const frame =
	"mx-auto w-full max-w-7xl border-stroke-soft-100 border-x dark:border-white/10";
const inset = "px-4 sm:px-8 lg:px-14";

function CategoryPill({
	href,
	active,
	onSelect,
	children,
}: {
	href: string;
	active: boolean;
	onSelect: () => void;
	children: ReactNode;
}) {
	return (
		<Link
			href={href}
			scroll={false}
			aria-current={active ? "page" : undefined}
			onClick={(event) => {
				// Let modified clicks open a new tab; plain clicks filter in place.
				if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
					return;
				}
				event.preventDefault();
				onSelect();
			}}
			className={cn(
				"shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[14px] transition-colors",
				active
					? "border-stroke-soft-100 bg-bg-white-0 text-text-strong-950 shadow-xs dark:border-white/15 dark:bg-white/[0.06] dark:text-white"
					: "border-transparent text-text-sub-600 hover:text-text-strong-950 dark:text-white/55 dark:hover:text-white",
			)}
		>
			{children}
		</Link>
	);
}

/**
 * Horizontally scrolling category pills. Each edge fades only while there is
 * more to scroll in that direction, so the first and last pill are never
 * cut off at rest.
 */
function CategoryNav({
	categories,
	activeCategorySlug,
	onSelect,
}: {
	categories: BlogCategoryDefinition[];
	activeCategorySlug?: string;
	onSelect: (slug: string | undefined) => void;
}) {
	const scrollerRef = useRef<HTMLElement>(null);
	const [edges, setEdges] = useState({ start: false, end: false });

	const updateEdges = useCallback(() => {
		const el = scrollerRef.current;
		if (!el) return;
		const max = el.scrollWidth - el.clientWidth;
		setEdges({ start: el.scrollLeft > 1, end: el.scrollLeft < max - 1 });
	}, []);

	// Keep the active pill visible, including after back/forward navigation.
	// biome-ignore lint/correctness/useExhaustiveDependencies: re-run when the active pill changes
	useEffect(() => {
		scrollerRef.current
			?.querySelector<HTMLElement>('[aria-current="page"]')
			?.scrollIntoView({ block: "nearest", inline: "nearest" });
	}, [activeCategorySlug]);

	useEffect(() => {
		const el = scrollerRef.current;
		if (!el) return;

		updateEdges();

		const observer = new ResizeObserver(updateEdges);
		observer.observe(el);
		return () => observer.disconnect();
	}, [updateEdges]);

	const fade =
		"pointer-events-none absolute inset-y-0 w-12 from-bg-white-0 to-transparent transition-opacity duration-200 dark:from-black";

	return (
		<div className="-mx-4 relative min-w-0 sm:mx-0">
			<nav
				ref={scrollerRef}
				aria-label="Blog categories"
				onScroll={updateEdges}
				className="flex gap-1 overflow-x-auto px-4 [scrollbar-width:none] sm:px-0 [&::-webkit-scrollbar]:hidden"
			>
				<CategoryPill
					href="/blog"
					active={!activeCategorySlug}
					onSelect={() => onSelect(undefined)}
				>
					All articles
				</CategoryPill>
				{categories.map((category) => (
					<CategoryPill
						key={category.slug}
						href={`/blog/category/${category.slug}`}
						active={category.slug === activeCategorySlug}
						onSelect={() => onSelect(category.slug)}
					>
						{category.name}
					</CategoryPill>
				))}
			</nav>
			<span
				aria-hidden="true"
				className={cn(
					fade,
					"left-0 bg-gradient-to-r",
					edges.start ? "opacity-100" : "opacity-0",
				)}
			/>
			<span
				aria-hidden="true"
				className={cn(
					fade,
					"right-0 bg-gradient-to-l",
					edges.end ? "opacity-100" : "opacity-0",
				)}
			/>
		</div>
	);
}

function categorySlugFromPath(pathname: string): string | undefined {
	return pathname.match(/^\/blog\/category\/([^/]+)/)?.[1];
}

/**
 * Blog listing shared by /blog and /blog/category/[slug]. Category pills
 * filter in place and update the URL with history, so the hero and scroll
 * position never move. Each category URL still renders server-side for SEO.
 */
export function BlogIndex({
	posts,
	categories,
	title = "Blog",
	activeCategorySlug: initialCategorySlug,
	children,
}: {
	/** Every published post; category filtering happens here. */
	posts: BlogPostDefinition[];
	categories: BlogCategoryDefinition[];
	title?: string;
	activeCategorySlug?: string;
	children?: ReactNode;
}) {
	const [query, setQuery] = useState("");
	const [activeCategorySlug, setActiveCategorySlug] =
		useState(initialCategorySlug);

	useEffect(() => {
		const onPopState = () =>
			setActiveCategorySlug(categorySlugFromPath(window.location.pathname));
		window.addEventListener("popstate", onPopState);
		return () => window.removeEventListener("popstate", onPopState);
	}, []);

	const selectCategory = useCallback((slug: string | undefined) => {
		setActiveCategorySlug(slug);
		window.history.pushState(
			null,
			"",
			slug ? `/blog/category/${slug}` : "/blog",
		);
	}, []);

	const activeCategory = categories.find(
		(category) => category.slug === activeCategorySlug,
	);

	// The hero is always the newest post, whatever the filter, so the top of
	// the page never changes while browsing categories or searching.
	const featured = useMemo(() => sortBlogPosts(posts)[0], [posts]);

	const gridPosts = useMemo(
		() =>
			filterBlogPosts(posts, { query }).filter(
				(post) =>
					post.slug !== featured?.slug &&
					(!activeCategory || post.category === activeCategory.name),
			),
		[posts, query, featured, activeCategory],
	);

	return (
		<div className="min-h-dvh bg-bg-white-0 dark:bg-black">
			{/* Lead: the newest post, identical on every listing URL */}
			<section className={cn(frame, inset, "pt-28 pb-16 sm:pt-36 sm:pb-24")}>
				<h1 className="sr-only">
					{activeCategory ? `${activeCategory.name} articles` : title}
				</h1>
				{featured ? <BlogPostFeaturedCard post={featured} /> : null}
			</section>

			{/* Recent posts header, filters and search */}
			<div className="border-stroke-soft-100 border-y dark:border-white/10">
				<div
					className={cn(
						frame,
						inset,
						"flex flex-col gap-5 py-6 lg:flex-row lg:items-center lg:justify-between",
					)}
				>
					<h2 className="shrink-0 font-medium text-[1.5rem] text-text-strong-950 tracking-[-0.02em] dark:text-white">
						{activeCategory?.name ?? "Recent posts"}
					</h2>

					<div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center">
						<CategoryNav
							categories={categories}
							activeCategorySlug={activeCategorySlug}
							onSelect={selectCategory}
						/>

						<span
							className="hidden h-6 w-px shrink-0 bg-stroke-soft-100 lg:block dark:bg-white/10"
							aria-hidden="true"
						/>

						<div className="flex shrink-0 items-center gap-2">
							<label className="relative block w-full lg:w-[260px]">
								<span className="sr-only">Search posts</span>
								<Icon
									name="search"
									className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3.5 size-4 text-text-soft-400"
									aria-hidden="true"
								/>
								<input
									type="search"
									value={query}
									onChange={(event) => setQuery(event.target.value)}
									placeholder="Search"
									className="h-10 w-full rounded-full border border-stroke-soft-100 bg-bg-white-0 pr-4 pl-10 text-[14px] text-text-strong-950 outline-none transition-colors placeholder:text-text-soft-400 focus:border-stroke-sub-300 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:focus:border-white/20 dark:placeholder:text-white/35"
								/>
							</label>
							<a
								href="/blog/feed.xml"
								className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-stroke-soft-100 text-text-sub-600 transition-colors hover:text-text-strong-950 dark:border-white/10 dark:text-white/55 dark:hover:text-white"
								aria-label="RSS feed"
							>
								<RssIcon className="size-4" />
							</a>
						</div>
					</div>
				</div>
			</div>

			{/* Grid: every post sits in its own bordered cell */}
			<div className={frame}>
				{gridPosts.length === 0 ? (
					<div className={cn(inset, "py-24 text-center")}>
						<p className="font-medium text-[16px] text-text-strong-950 dark:text-white">
							No posts found
						</p>
						<p className="mt-2 text-[14px] text-text-sub-600 dark:text-white/50">
							Try another category or search term.
						</p>
					</div>
				) : (
					<BlogPostGrid posts={gridPosts} />
				)}
			</div>

			{/* CTA Section */}
			{children}
		</div>
	);
}
