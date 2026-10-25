"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { BlogBody } from "@reloop/web/components/landing/blog/blog-body";
import { BlogCta } from "@reloop/web/components/landing/blog/blog-cta";
import { BlogPostGrid } from "@reloop/web/components/landing/blog/blog-post-card";
import { BlogPostCoverImage } from "@reloop/web/components/landing/blog/blog-post-cover-image";
import {
	BlogTableOfContents,
	BlogTocRail,
} from "@reloop/web/components/landing/blog/blog-table-of-contents";
import {
	formatBlogDateUpper,
	formatReadTime,
	getCategoryPath,
} from "@reloop/web/lib/landing/blog/utils";
import type {
	BlogPostDefinition,
	BlogTocItem,
} from "@reloop/web/lib/landing/types";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { siYcombinator } from "simple-icons";

function ArrowLeftIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			viewBox="0 0 16 16"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d="M12.5 8h-9M7.5 4l-4 4 4 4" />
		</svg>
	);
}

function SparklesIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			viewBox="0 0 16 16"
			fill="currentColor"
			aria-hidden="true"
		>
			<path d="M8 0L9.79611 6.20389L16 8L9.79611 9.79611L8 16L6.20389 9.79611L0 8L6.20389 6.20389L8 0Z" />
		</svg>
	);
}

function LinkIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
			<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
		</svg>
	);
}

function CheckIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			viewBox="0 0 16 16"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d="M3.5 8.5l3 3 6-6" />
		</svg>
	);
}

const floatingCardClassName =
	"w-full rounded-2xl border border-stroke-soft-200 bg-white p-5 dark:border-white/10 dark:bg-bg-weak-50";

const shareButtonClassName =
	"flex size-8 items-center justify-center rounded-full border border-stroke-soft-200 bg-bg-weak-50 text-text-sub-600 transition-colors hover:border-stroke-soft-300 hover:text-text-strong-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/70 dark:hover:border-white/20 dark:hover:text-white";

function ShareButtons({ title }: { title: string }) {
	const [copied, setCopied] = useState(false);

	const handleCopyLink = () => {
		if (typeof window !== "undefined") {
			navigator.clipboard.writeText(window.location.href);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	const shareTitle = encodeURIComponent(title);
	const [shareUrl, setShareUrl] = useState("");

	useEffect(() => {
		setShareUrl(encodeURIComponent(window.location.href));
	}, []);

	return (
		<div className="flex items-center gap-2">
			<a
				href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
				target="_blank"
				rel="noopener noreferrer"
				className={shareButtonClassName}
				aria-label="Share on LinkedIn"
			>
				<Icon name="linkedin" className="size-3.5" />
			</a>
			<a
				href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
				target="_blank"
				rel="noopener noreferrer"
				className={shareButtonClassName}
				aria-label="Share on X"
			>
				<Icon name="twitter" className="size-3.5" />
			</a>
			<a
				href={`https://news.ycombinator.com/submitlink?u=${shareUrl}&t=${shareTitle}`}
				target="_blank"
				rel="noopener noreferrer"
				className={shareButtonClassName}
				aria-label="Share on Hacker News"
			>
				<svg
					className="size-3.5 fill-current"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path d={siYcombinator.path} />
				</svg>
				<span className="sr-only">Share on Hacker News</span>
			</a>
			<button
				type="button"
				onClick={handleCopyLink}
				className={shareButtonClassName}
				aria-label="Copy link"
				title={copied ? "Copied!" : "Copy link"}
			>
				{copied ? (
					<CheckIcon className="size-3.5 text-text-strong-950 dark:text-white" />
				) : (
					<LinkIcon className="size-3.5" />
				)}
			</button>
		</div>
	);
}

function TocCard({
	toc,
	className,
}: {
	toc: BlogTocItem[];
	className?: string;
}) {
	return (
		<div className={cn(floatingCardClassName, "flex flex-col", className)}>
			<h2 className="mb-3 font-medium text-sm text-text-strong-950 dark:text-white">
				On this page
			</h2>
			<div className="-mr-2 min-h-0 overflow-y-auto pr-2">
				<BlogTableOfContents items={toc} showHeader={false} />
			</div>
		</div>
	);
}

/** Whether the previous history entry is a blog page on this site. */
function previousPageIsBlog(): boolean {
	try {
		// The Navigation API sees client-side (soft) navigations; the referrer
		// only covers full page loads, so it is the fallback.
		const navigation = (
			window as Window & {
				navigation?: {
					canGoBack: boolean;
					currentEntry: { index: number } | null;
					entries: () => { url: string | null }[];
				};
			}
		).navigation;
		let previousUrl: string | null = null;
		if (navigation?.currentEntry) {
			if (!navigation.canGoBack) return false;
			previousUrl =
				navigation.entries()[navigation.currentEntry.index - 1]?.url ?? null;
		} else if (window.history.length > 1) {
			previousUrl = document.referrer || null;
		}
		if (!previousUrl) return false;
		const previous = new URL(previousUrl);
		return (
			previous.origin === window.location.origin &&
			previous.pathname.startsWith("/blog")
		);
	} catch {
		return false;
	}
}

/**
 * Returns to the previous page when the reader came from elsewhere on the
 * blog, so they land back at their spot in the list. Otherwise it is a plain
 * link to the blog index (also what middle-click and new-tab use).
 */
function BackToBlogButton() {
	const router = useRouter();

	const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
		if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
			return;
		}
		if (previousPageIsBlog()) {
			e.preventDefault();
			router.back();
		}
	};

	return (
		<Link
			href="/blog"
			onClick={handleClick}
			className="group inline-flex h-8 items-center gap-1.5 self-start rounded-full border border-stroke-soft-200 bg-white pr-3.5 pl-2.5 font-medium text-[13px] text-text-sub-600 transition-colors hover:border-stroke-soft-300 hover:bg-bg-weak-50 hover:text-text-strong-950 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/70 dark:hover:border-white/20 dark:hover:bg-white/[0.06] dark:hover:text-white"
		>
			<ArrowLeftIcon className="group-hover:-translate-x-0.5 size-4 shrink-0 transition-transform duration-200" />
			<span>All articles</span>
		</Link>
	);
}

export function BlogPostPageView({
	post,
	body,
	toc,
	relatedPosts = [],
}: {
	post: BlogPostDefinition;
	body: ReactNode;
	toc: BlogTocItem[];
	relatedPosts?: BlogPostDefinition[];
}) {
	const mainRef = useRef<HTMLElement>(null);
	const [railsVisible, setRailsVisible] = useState(false);

	// Show the side cards only while the article crosses the middle of the viewport,
	// so they never sit on top of the header or the CTA below.
	useEffect(() => {
		const main = mainRef.current;
		if (!main) return;
		const observer = new IntersectionObserver(
			([entry]) => setRailsVisible(entry?.isIntersecting ?? false),
			{ rootMargin: "-50% 0px -50% 0px" },
		);
		observer.observe(main);
		return () => observer.disconnect();
	}, []);

	return (
		<div className="min-h-dvh bg-white dark:bg-black">
			{/* Header */}
			<div className="w-full border-stroke-soft-100 border-b dark:border-white/10">
				<div className="mx-auto w-full max-w-7xl border-stroke-soft-100 border-x px-4 pt-32 pb-12 sm:px-6 lg:px-8 dark:border-white/10">
					<header className="mx-auto flex w-full max-w-[720px] flex-col gap-4">
						<div className="mb-2">
							<BackToBlogButton />
						</div>
						<div className="flex flex-wrap items-center gap-2 font-medium font-mono text-xs/[150%] uppercase tracking-[0.6px]">
							<Link
								href={getCategoryPath(post.category)}
								className="text-text-strong-950 transition-opacity hover:opacity-70 dark:text-white"
							>
								{post.category}
							</Link>
							<span className="text-text-soft-400 dark:text-white/30">/</span>
							<time
								dateTime={post.publishedAt}
								className="text-text-sub-600 dark:text-white/60"
							>
								{formatBlogDateUpper(post.publishedAt)}
							</time>
						</div>
						<h1 className="text-balance font-semibold text-2xl text-text-strong-950 leading-tight tracking-tight sm:text-3xl lg:text-[2.125rem] dark:text-white">
							{post.title}
						</h1>
						<div className="mt-2 flex flex-wrap items-center justify-between gap-4">
							<div className="flex items-center gap-3">
								{post.author.avatar ? (
									<Image
										src={post.author.avatar}
										alt={post.author.name}
										width={36}
										height={36}
										className="size-9 shrink-0 rounded-full border border-stroke-soft-200 object-cover dark:border-white/10"
									/>
								) : (
									<div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-neutral-900 font-medium text-sm text-white dark:bg-white/10 dark:text-white">
										{post.author.name.charAt(0)}
									</div>
								)}
								<div>
									<p className="font-semibold text-sm text-text-strong-950 leading-snug dark:text-white">
										{post.author.name}
									</p>
									<p className="text-text-sub-600 text-xs dark:text-white/50">
										{post.author.role || "Engineering"}
										<span className="mx-1.5 text-text-soft-400 dark:text-white/30">
											·
										</span>
										{formatReadTime(post.readTime)}
									</p>
								</div>
							</div>
							<ShareButtons title={post.title} />
						</div>
					</header>
				</div>
			</div>

			{/* Article with the table of contents rail on the right edge */}
			<div className="mx-auto w-full max-w-7xl border-stroke-soft-100 border-x px-4 sm:px-6 lg:px-8 dark:border-white/10">
				{toc.length > 0 ? (
					<div
						className={cn(
							"-translate-y-1/2 fixed top-1/2 right-4 z-30 hidden transition-opacity duration-300 xl:block",
							railsVisible ? "opacity-100" : "pointer-events-none opacity-0",
						)}
					>
						<BlogTocRail items={toc} />
					</div>
				) : null}

				<main
					ref={mainRef}
					className="mx-auto w-full min-w-0 max-w-[720px] space-y-8 pt-10 pb-16"
				>
					{toc.length > 0 ? <TocCard toc={toc} className="xl:hidden" /> : null}

					{post.image ? (
						<div className="overflow-hidden rounded-2xl">
							<BlogPostCoverImage
								slug={post.slug}
								image={post.image}
								blurDataURL={post.imageBlurDataURL}
								alt={post.title}
								priority
								variant="hero"
							/>
						</div>
					) : null}

					{post.description ? (
						<div className="rounded-2xl border border-stroke-soft-200 bg-bg-weak-50/70 p-6 dark:border-white/10 dark:bg-white/[0.03]">
							<div className="mb-3 flex items-center gap-1.5 font-mono font-semibold text-[11px] text-text-strong-950 uppercase tracking-widest dark:text-white">
								<SparklesIcon className="size-3" />
								<span>Summary</span>
							</div>
							<p className="text-[14px] text-text-sub-600 leading-relaxed sm:text-[14.5px] dark:text-white/60">
								{post.description}
							</p>
						</div>
					) : null}

					<BlogBody>{body}</BlogBody>
				</main>
			</div>

			{relatedPosts.length > 0 ? (
				<section className="border-stroke-soft-100 border-t dark:border-white/10">
					<div className="mx-auto w-full max-w-7xl border-stroke-soft-100 border-x dark:border-white/10">
						<h2 className="border-stroke-soft-100 border-b px-4 py-8 font-medium text-[1.5rem] text-text-strong-950 tracking-[-0.02em] sm:px-8 lg:px-12 dark:border-white/10 dark:text-white">
							You may also like
						</h2>
						<BlogPostGrid posts={relatedPosts} />
					</div>
				</section>
			) : null}

			<BlogCta
				category={post.category}
				// The related grid already ends with a rule; a second one would double up.
				showTopRule={relatedPosts.length === 0}
				headlineLine1="Ship your first email with Reloop"
				headlineLine2="in minutes."
				sub="Open-source, deliverability-focused, and yours to self-host or run on Reloop Cloud. No lock-in, no rewrite later."
			/>
		</div>
	);
}
