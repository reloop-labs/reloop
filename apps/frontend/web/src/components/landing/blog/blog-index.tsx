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

const PAGE_SIZE = 30;

function categorySlugFromPath(pathname: string): string | undefined {
	return pathname.match(/^\/blog\/category\/([^/]+)/)?.[1];
}

function pageFromSearch(search: string): number {
	const page = Number(new URLSearchParams(search).get("page"));
	return Number.isInteger(page) && page > 1 ? page : 1;
}

function listingPath(categorySlug: string | undefined): string {
	return categorySlug ? `/blog/category/${categorySlug}` : "/blog";
}

function pageHref(categorySlug: string | undefined, page: number): string {
	const path = listingPath(categorySlug);
	return page > 1 ? `${path}?page=${page}` : path;
}

/** Page numbers to show, with null for a gap: 1 … 4 5 6 … 9 */
function pageItems(page: number, pageCount: number): (number | null)[] {
	const pages = new Set([1, pageCount, page - 1, page, page + 1]);
	const sorted = [...pages]
		.filter((n) => n >= 1 && n <= pageCount)
		.sort((a, b) => a - b);
	const items: (number | null)[] = [];
	for (const n of sorted) {
		const previous = items[items.length - 1];
		// A gap of one page shows that page instead of an ellipsis.
		if (typeof previous === "number" && n - previous === 2) {
			items.push(previous + 1);
		} else if (typeof previous === "number" && n - previous > 2) {
			items.push(null);
		}
		items.push(n);
	}
	return items;
}

function PageLink({
	href,
	onSelect,
	disabled,
	active,
	label,
	children,
}: {
	href: string;
	onSelect: () => void;
	disabled?: boolean;
	active?: boolean;
	label?: string;
	children: ReactNode;
}) {
	const base =
		"inline-flex h-10 min-w-10 items-center justify-center gap-1.5 rounded-full border px-3.5 text-[14px] tabular-nums transition-colors";

	if (disabled) {
		return (
			<span
				aria-disabled="true"
				className={cn(
					base,
					"border-transparent text-text-soft-400 dark:text-white/25",
				)}
			>
				{children}
			</span>
		);
	}

	return (
		<a
			href={href}
			aria-label={label}
			aria-current={active ? "page" : undefined}
			onClick={(event) => {
				// Let modified clicks open a new tab; plain clicks page in place.
				if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
					return;
				}
				event.preventDefault();
				onSelect();
			}}
			className={cn(
				base,
				active
					? "border-stroke-soft-100 bg-bg-white-0 text-text-strong-950 shadow-xs dark:border-white/15 dark:bg-white/[0.06] dark:text-white"
					: "border-transparent text-text-sub-600 hover:text-text-strong-950 dark:text-white/55 dark:hover:text-white",
			)}
		>
			{children}
		</a>
	);
}

function BlogPagination({
	page,
	pageCount,
	hrefFor,
	onSelect,
}: {
	page: number;
	pageCount: number;
	hrefFor: (page: number) => string;
	onSelect: (page: number) => void;
}) {
	return (
		<nav
			aria-label="Blog pages"
			className={cn(inset, "flex items-center justify-between gap-2 py-8")}
		>
			<PageLink
				href={hrefFor(page - 1)}
				onSelect={() => onSelect(page - 1)}
				disabled={page <= 1}
				label="Previous page"
			>
				<Icon name="arrow-left" className="size-4" />
				<span className="hidden sm:inline">Previous</span>
			</PageLink>

			<div className="flex items-center gap-1">
				{pageItems(page, pageCount).map((item, index) =>
					item === null ? (
						<span
							key={`gap-${index}`}
							className="px-1.5 text-[14px] text-text-soft-400 dark:text-white/35"
							aria-hidden="true"
						>
							…
						</span>
					) : (
						<PageLink
							key={item}
							href={hrefFor(item)}
							onSelect={() => onSelect(item)}
							active={item === page}
							label={`Page ${item}`}
						>
							{item}
						</PageLink>
					),
				)}
			</div>

			<PageLink
				href={hrefFor(page + 1)}
				onSelect={() => onSelect(page + 1)}
				disabled={page >= pageCount}
				label="Next page"
			>
				<span className="hidden sm:inline">Next</span>
				<Icon name="arrow-right" className="size-4" />
			</PageLink>
		</nav>
	);
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
	const [page, setPage] = useState(1);
	const listRef = useRef<HTMLDivElement>(null);

	// The listing is static, so the page number is read from the URL here.
	useEffect(() => {
		setPage(pageFromSearch(window.location.search));

		const onPopState = () => {
			setActiveCategorySlug(categorySlugFromPath(window.location.pathname));
			setPage(pageFromSearch(window.location.search));
		};
		window.addEventListener("popstate", onPopState);
		return () => window.removeEventListener("popstate", onPopState);
	}, []);

	const selectCategory = useCallback((slug: string | undefined) => {
		setActiveCategorySlug(slug);
		setPage(1);
		window.history.pushState(null, "", listingPath(slug));
	}, []);

	const search = useCallback(
		(value: string) => {
			setQuery(value);
			if (page !== 1) {
				setPage(1);
				window.history.replaceState(null, "", listingPath(activeCategorySlug));
			}
		},
		[page, activeCategorySlug],
	);

	const selectPage = useCallback(
		(next: number) => {
			setPage(next);
			window.history.pushState(null, "", pageHref(activeCategorySlug, next));
			listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
		},
		[activeCategorySlug],
	);

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

	const pageCount = Math.max(1, Math.ceil(gridPosts.length / PAGE_SIZE));
	const currentPage = Math.min(page, pageCount);
	const pagePosts = gridPosts.slice(
		(currentPage - 1) * PAGE_SIZE,
		currentPage * PAGE_SIZE,
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
			<div
				ref={listRef}
				className="scroll-mt-20 border-stroke-soft-100 border-y dark:border-white/10"
			>
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
									onChange={(event) => search(event.target.value)}
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
					<>
						<BlogPostGrid posts={pagePosts} />
						{pageCount > 1 ? (
							<BlogPagination
								page={currentPage}
								pageCount={pageCount}
								hrefFor={(n) => pageHref(activeCategorySlug, n)}
								onSelect={selectPage}
							/>
						) : null}
					</>
				)}
			</div>

			{/* CTA Section */}
			{children}
		</div>
	);
}
