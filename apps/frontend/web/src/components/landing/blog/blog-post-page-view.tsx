"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { BlogBody } from "@reloop/web/components/landing/blog/blog-body";
import { BlogCta } from "@reloop/web/components/landing/blog/blog-cta";
import { BlogPostCoverImage } from "@reloop/web/components/landing/blog/blog-post-cover-image";
import { BlogTableOfContents } from "@reloop/web/components/landing/blog/blog-table-of-contents";
import {
	formatBlogDate,
	formatBlogDateUpper,
	formatReadTime,
	getCategoryPath,
} from "@reloop/web/lib/landing/blog/utils";
import type {
	BlogPostDefinition,
	BlogTocItem,
} from "@reloop/web/lib/landing/types";
import { hostedSignupHref } from "@reloop/web/lib/site";
import Image from "next/image";
import Link from "next/link";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { siYcombinator } from "simple-icons";

function ArrowLeftIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			viewBox="0 0 15 15"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
		>
			<g
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1.5"
				clipPath="url(#blog-back-arrow-clip)"
			>
				<path d="M1.5 5.056h8.667a3.333 3.333 0 0 1 0 6.666H6.833" />
				<path d="M4.611 8.167 1.5 5.056l3.111-3.112" />
			</g>
			<defs>
				<clipPath id="blog-back-arrow-clip">
					<path fill="#fff" d="M0 0h15v15H0z" />
				</clipPath>
			</defs>
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

function StackMark({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
		>
			<g transform="rotate(90, 12, 12)">
				<path
					d="M22 10V6.5L12 11.5V15L22 10Z"
					fill="currentColor"
					fillOpacity={0.25}
				/>
				<path
					d="M22 17.5V14L12 19V22.5L22 17.5Z"
					fill="currentColor"
					fillOpacity={0.25}
				/>
				<path d="M12 19V22.3213" stroke="currentColor" />
				<path
					d="M2 14L11.3292 18.6646C11.7515 18.8757 12.2485 18.8757 12.6708 18.6646L22 14"
					stroke="currentColor"
				/>
				<path
					d="M6 12L2.55279 13.7236C2.214 13.893 2 14.2393 2 14.618V16.882C2 17.2607 2.214 17.607 2.55279 17.7764L11.3292 22.1646C11.7515 22.3757 12.2485 22.3757 12.6708 22.1646L21.4472 17.7764C21.786 17.607 22 17.2607 22 16.882V14.618C22 14.2393 21.786 13.893 21.4472 13.7236L18 12"
					stroke="currentColor"
				/>
				<path d="M12 11.5V14.8229" stroke="currentColor" />
				<path
					d="M2 6.5L11.3292 11.1646C11.7515 11.3757 12.2485 11.3757 12.6708 11.1646L22 6.5"
					stroke="currentColor"
				/>
				<path
					d="M11.3292 14.6646L2.55279 10.2764C2.214 10.107 2 9.76074 2 9.38197V7.11803C2 6.73926 2.214 6.393 2.55279 6.22361L11.3292 1.83541C11.7515 1.62426 12.2485 1.62426 12.6708 1.83541L21.4472 6.22361C21.786 6.393 22 6.73926 22 7.11803V9.38197C22 9.76074 21.786 10.107 21.4472 10.2764L12.6708 14.6646C12.2485 14.8757 11.7515 14.8757 11.3292 14.6646Z"
					stroke="currentColor"
				/>
			</g>
		</svg>
	);
}

const floatingCardClassName =
	"w-full rounded-2xl border border-stroke-soft-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.14)] dark:border-white/10 dark:bg-bg-weak-50 dark:shadow-none";

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
			{toc.length > 0 ? (
				<>
					<h2 className="mb-3 font-medium text-sm text-text-strong-950 dark:text-white">
						On this page
					</h2>
					<div className="-mr-2 min-h-0 overflow-y-auto pr-2">
						<BlogTableOfContents items={toc} showHeader={false} />
					</div>
				</>
			) : null}
			<Link
				href="/blog"
				className={cn(
					"inline-flex items-center gap-1.5 font-medium text-text-sub-600 text-xs transition-colors hover:text-text-strong-950 dark:text-white/60 dark:hover:text-white",
					toc.length > 0 &&
						"-mx-5 mt-4 border-stroke-soft-200 border-t px-5 pt-4 dark:border-white/10",
				)}
			>
				<ArrowLeftIcon className="size-3.5 shrink-0 select-none" />
				<span>All articles</span>
			</Link>
		</div>
	);
}

function GetStartedCard() {
	return (
		<div className={floatingCardClassName}>
			<div className="relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-xl border border-stroke-soft-200/70 bg-bg-weak-50/60 text-text-strong-950 dark:border-white/[0.06] dark:bg-black/40 dark:text-white">
				<div
					className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
					style={{
						backgroundImage:
							"repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 10px)",
					}}
				/>
				<svg
					className="pointer-events-none absolute inset-0 size-full text-text-strong-950/[0.06] dark:text-white/[0.07]"
					viewBox="0 0 200 112"
					fill="none"
					aria-hidden="true"
				>
					<circle
						cx="100"
						cy="56"
						r="26"
						stroke="currentColor"
						strokeDasharray="3 3"
					/>
					<circle
						cx="100"
						cy="56"
						r="50"
						stroke="currentColor"
						strokeWidth="0.75"
					/>
					<circle
						cx="100"
						cy="56"
						r="78"
						stroke="currentColor"
						strokeDasharray="4 4"
					/>
				</svg>
				<StackMark className="relative size-16" />
			</div>

			<p className="mt-5 font-medium font-mono text-[11px] text-text-sub-600 uppercase tracking-widest dark:text-white/45">
				Get started
			</p>
			<h3 className="mt-1.5 font-semibold text-text-strong-950 text-xl tracking-tight dark:text-white">
				Ready to send?
			</h3>
			<p className="mt-2 text-[13.5px] text-text-sub-600 leading-relaxed dark:text-white/60">
				Email API, SMTP relay and agent inboxes.{" "}
				<span className="font-medium text-text-strong-950 dark:text-white">
					Open source, self-host or cloud.
				</span>
			</p>

			<div className="mt-5 flex flex-col gap-2">
				<a
					href={hostedSignupHref}
					className="inline-flex h-9 items-center justify-center rounded-xl bg-text-strong-950 font-medium text-sm text-white transition-colors hover:bg-text-strong-950/85 active:scale-[0.98] dark:bg-white dark:text-black dark:hover:bg-white/90"
				>
					Start for free
				</a>
				<a
					href="/docs"
					className="inline-flex h-9 items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-weak-50 font-medium text-sm text-text-strong-950 transition-colors hover:border-stroke-soft-300 active:scale-[0.98] dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:border-white/20"
				>
					Read the docs
				</a>
			</div>

			<a
				href="/llms.txt"
				className="group mt-4 flex items-center justify-center gap-1 text-text-soft-400 text-xs transition-colors hover:text-text-strong-950 dark:text-white/40 dark:hover:text-white"
			>
				<span>AI agent? Read llms.txt</span>
				<span
					aria-hidden="true"
					className="transition-transform duration-200 group-hover:translate-x-0.5"
				>
					→
				</span>
			</a>
		</div>
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
			<div className="w-full border-stroke-soft-200 border-b dark:border-white/10">
				<div className="mx-auto w-full max-w-7xl border-stroke-soft-100 border-x px-4 pt-32 pb-12 sm:px-6 lg:px-8 dark:border-white/10">
					<header className="mx-auto flex w-full max-w-[720px] flex-col gap-4">
						<div className="flex flex-wrap items-center gap-2 font-medium font-mono text-xs/[150%] uppercase tracking-[0.6px]">
							<Link
								href={getCategoryPath(post.category)}
								className="text-primary-base transition-opacity hover:opacity-80"
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

			{/* Article with floating side cards */}
			<div className="mx-auto w-full max-w-7xl border-stroke-soft-100 border-x px-4 sm:px-6 lg:px-8 dark:border-white/10">
				<aside
					aria-label="Table of contents"
					className={cn(
						"-translate-y-1/2 fixed top-1/2 left-4 z-30 hidden w-[260px] transition-opacity duration-300 xl:block",
						railsVisible ? "opacity-100" : "pointer-events-none opacity-0",
					)}
				>
					<TocCard toc={toc} className="max-h-[calc(100dvh-8rem)]" />
				</aside>
				<aside
					aria-label="Get started"
					className={cn(
						"-translate-y-1/2 fixed top-1/2 right-4 z-30 hidden w-[260px] transition-opacity duration-300 xl:block",
						railsVisible ? "opacity-100" : "pointer-events-none opacity-0",
					)}
				>
					<GetStartedCard />
				</aside>

				<main
					ref={mainRef}
					className="mx-auto w-full min-w-0 max-w-[720px] space-y-8 pt-10 pb-16"
				>
					<TocCard toc={toc} className="xl:hidden" />

					{post.image ? (
						<div className="overflow-hidden rounded-2xl">
							<BlogPostCoverImage
								slug={post.slug}
								image={post.image}
								alt={post.title}
								priority
								variant="hero"
							/>
						</div>
					) : null}

					{post.description ? (
						<div className="rounded-2xl border border-stroke-soft-200 bg-bg-weak-50/70 p-6 dark:border-white/10 dark:bg-white/[0.03]">
							<div className="mb-3 flex items-center gap-1.5 font-mono font-semibold text-[11px] text-primary-base uppercase tracking-widest">
								<SparklesIcon className="size-3" />
								<span>Summary</span>
							</div>
							<p className="text-[14px] text-text-sub-600 leading-relaxed sm:text-[14.5px] dark:text-white/60">
								{post.description}
							</p>
						</div>
					) : null}

					<BlogBody>{body}</BlogBody>

					{relatedPosts.length > 0 ? (
						<div className="border-stroke-soft-200 border-t pt-8 dark:border-white/10">
							<h2 className="mb-6 font-semibold text-text-strong-950 tracking-tight dark:text-white">
								Read more
							</h2>
							<div className="flex flex-col gap-6 sm:gap-7">
								{relatedPosts.map((relatedPost) => (
									<Link
										key={relatedPost.slug}
										href={`/blog/${relatedPost.slug}`}
										className="group flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5"
									>
										<div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl bg-bg-weak-50/50 sm:w-44 md:w-48 dark:bg-white/[0.04]">
											<BlogPostCoverImage
												slug={relatedPost.slug}
												image={relatedPost.image}
												alt={relatedPost.title}
											/>
										</div>
										<div className="flex flex-col justify-center space-y-1">
											<h3 className="font-semibold text-base text-text-strong-950 decoration-text-strong-950/40 underline-offset-4 transition-colors group-hover:underline dark:text-white dark:group-hover:decoration-white/40">
												{relatedPost.title}
											</h3>
											<p className="line-clamp-2 text-text-sub-600 text-xs leading-relaxed sm:text-sm dark:text-white/70">
												{relatedPost.description}
											</p>
											<time
												dateTime={relatedPost.publishedAt}
												className="text-text-sub-600 text-xs dark:text-white/50"
											>
												{formatBlogDate(relatedPost.publishedAt)}
											</time>
										</div>
									</Link>
								))}
							</div>
						</div>
					) : null}
				</main>
			</div>

			<BlogCta
				category={post.category}
				headlineLine1="Ship your first email with Reloop"
				headlineLine2="in minutes."
				sub="Open-source, deliverability-focused, and yours to self-host or run on Reloop Cloud. No lock-in, no rewrite later."
			/>
		</div>
	);
}
