"use client";

import { Icon } from "@reloop/ui/icon";
import { BlogBody } from "@reloop/web/components/landing/blog/blog-body";
import { BlogCta } from "@reloop/web/components/landing/blog/blog-cta";
import { BlogPostCoverImage } from "@reloop/web/components/landing/blog/blog-post-cover-image";
import { BlogTableOfContents } from "@reloop/web/components/landing/blog/blog-table-of-contents";
import {
	formatBlogDate,
	formatBlogDateUpper,
	formatReadTimeUpper,
	getCategoryPath,
} from "@reloop/web/lib/landing/blog/utils";
import type {
	BlogPostDefinition,
	BlogTocItem,
} from "@reloop/web/lib/landing/types";
import Image from "next/image";
import Link from "next/link";
import { type ReactNode, useState } from "react";
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
	const [copied, setCopied] = useState(false);

	const handleCopyLink = () => {
		if (typeof window !== "undefined") {
			navigator.clipboard.writeText(window.location.href);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	const shareTitle = encodeURIComponent(post.title);
	const shareUrl =
		typeof window !== "undefined"
			? encodeURIComponent(window.location.href)
			: "";

	return (
		<div className="min-h-dvh bg-white dark:bg-black">
			{/* Top Header Section with Full-Width Horizontal Border */}
			<div className="w-full border-stroke-soft-200 border-b dark:border-white/10">
				<div className="mx-auto w-full max-w-5xl border-stroke-soft-200 border-x px-4 pt-32 pb-14 sm:px-6 md:max-w-7xl lg:px-8 dark:border-white/10">
					<header className="text-left">
						<div className="flex w-full max-w-[680px] flex-col gap-4">
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
							<h1 className="font-semibold text-text-strong-950 text-xl leading-snug tracking-tight sm:text-2xl lg:text-[1.65rem] dark:text-white">
								{post.title}
							</h1>
							<p className="font-medium font-mono text-text-sub-600 text-xs/[150%] uppercase tracking-[0.6px] dark:text-white/60">
								{formatReadTimeUpper(post.readTime)}
							</p>
						</div>
					</header>
				</div>
			</div>

			{/* Main Article Container */}
			<div className="mx-auto w-full max-w-5xl border-stroke-soft-200 border-x px-4 sm:px-6 md:max-w-7xl lg:px-8 dark:border-white/10">
				{/* 3-Column Content Grid */}
				<div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-0">
					{/* Left Column: Table of Contents */}
					<aside className="lg:col-span-3 lg:border-stroke-soft-200 lg:border-r lg:pt-10 lg:pr-8 lg:pb-16 dark:lg:border-white/10">
						<div className="space-y-5 lg:sticky lg:top-28">
							<Link
								href="/blog"
								className="inline-flex items-center gap-1.5 font-medium text-text-sub-600 text-xs transition-colors hover:text-text-strong-950 dark:text-white/60 dark:hover:text-white"
							>
								<ArrowLeftIcon className="size-3.5 shrink-0 select-none" />
								<span>All articles</span>
							</Link>
							{toc.length > 0 ? <BlogTableOfContents items={toc} /> : null}
						</div>
					</aside>

					{/* Center Column: Main Content */}
					<main className="space-y-8 lg:col-span-6 lg:p-10 lg:pb-16">
						{/* Cover / Benchmark Image */}
						{post.image ? (
							<div className="overflow-hidden rounded-2xl border border-stroke-soft-200 dark:border-white/10">
								<BlogPostCoverImage
									slug={post.slug}
									image={post.image}
									alt={post.title}
									priority
									variant="hero"
								/>
							</div>
						) : null}

						{/* Summary Box */}
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

						{/* Blog Article Body */}
						<BlogBody>{body}</BlogBody>

						{/* Read More Section */}
						{relatedPosts.length > 0 ? (
							<div className="-mx-4 sm:-mx-6 lg:-mx-10 border-stroke-soft-200 border-t px-4 pt-5 sm:px-6 lg:px-10 dark:border-white/10">
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
											<div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl border border-stroke-soft-200/80 bg-bg-weak-50/50 sm:w-44 md:w-48 dark:border-white/10 dark:bg-white/[0.04]">
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

					{/* Right Column: Author Info, Share & Conversion Card */}
					<aside className="lg:col-span-3 lg:border-stroke-soft-200 lg:border-l lg:pt-10 lg:pb-16 lg:pl-8 dark:lg:border-white/10">
						<div className="space-y-8 lg:sticky lg:top-28">
							{/* Author Card */}
							<div>
								<h3 className="mb-3 font-medium font-mono text-[11px] text-text-sub-600 uppercase tracking-widest dark:text-white/45">
									Written by
								</h3>
								<div className="flex items-center gap-3">
									{post.author.avatar ? (
										<Image
											src={post.author.avatar}
											alt={post.author.name}
											width={40}
											height={40}
											className="size-10 shrink-0 rounded-full border border-stroke-soft-200 object-cover dark:border-white/10"
										/>
									) : (
										<div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-neutral-900 font-medium text-sm text-white dark:bg-white/10 dark:text-white">
											{post.author.name.charAt(0)}
										</div>
									)}
									<div>
										<p className="font-semibold text-sm text-text-strong-950 leading-snug dark:text-white">
											{post.author.name}
										</p>
										<p className="text-text-sub-600 text-xs dark:text-white/50">
											{post.author.role || "Engineering"}
										</p>
									</div>
								</div>
							</div>

							{/* Share Article Section */}
							<div>
								<h3 className="mb-3 font-medium font-mono text-[11px] text-text-sub-600 uppercase tracking-widest dark:text-white/45">
									Share this article
								</h3>
								<div className="flex items-center gap-2">
									<a
										href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
										target="_blank"
										rel="noopener noreferrer"
										className="flex size-8 items-center justify-center rounded-full border border-stroke-soft-200 bg-bg-weak-50 text-text-sub-600 transition-colors hover:border-stroke-soft-300 hover:text-text-strong-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/70 dark:hover:border-white/20 dark:hover:text-white"
										aria-label="Share on LinkedIn"
									>
										<Icon name="linkedin" className="size-3.5" />
									</a>
									<a
										href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
										target="_blank"
										rel="noopener noreferrer"
										className="flex size-8 items-center justify-center rounded-full border border-stroke-soft-200 bg-bg-weak-50 text-text-sub-600 transition-colors hover:border-stroke-soft-300 hover:text-text-strong-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/70 dark:hover:border-white/20 dark:hover:text-white"
										aria-label="Share on X"
									>
										<Icon name="twitter" className="size-3.5" />
									</a>
									{/** biome-ignore lint/a11y/useAnchorContent: <explanation> */}
									<a
										href={`https://news.ycombinator.com/submitlink?u=${shareUrl}&t=${shareTitle}`}
										target="_blank"
										rel="noopener noreferrer"
										className="flex size-8 items-center justify-center rounded-full border border-stroke-soft-200 bg-bg-weak-50 text-text-sub-600 transition-colors hover:border-stroke-soft-300 hover:text-text-strong-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/70 dark:hover:border-white/20 dark:hover:text-white"
										aria-label="Share on Hacker News"
									>
										<svg
											className="size-3.5 fill-current"
											viewBox="0 0 24 24"
											aria-hidden="true"
										>
											<path d={siYcombinator.path} />
										</svg>
									</a>
									<button
										type="button"
										onClick={handleCopyLink}
										className="flex size-8 items-center justify-center rounded-full border border-stroke-soft-200 bg-bg-weak-50 text-text-sub-600 transition-colors hover:border-stroke-soft-300 hover:text-text-strong-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/70 dark:hover:border-white/20 dark:hover:text-white"
										aria-label="Copy link"
										title={copied ? "Copied!" : "Copy link"}
									>
										{copied ? (
											<CheckIcon className="size-3.5 text-primary-base" />
										) : (
											<LinkIcon className="size-3.5" />
										)}
									</button>
								</div>
							</div>

							{/* Dub-style Product CTA Card */}
							<a
								href="/dashboard/signup"
								className="group relative block overflow-hidden rounded-2xl border border-stroke-soft-200/80 bg-white p-3.5 transition-all duration-200 hover:border-stroke-soft-300 hover:shadow-black/5 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20 dark:hover:shadow-black/40"
							>
								{/* Top Product Preview SVG */}
								<div className="relative mb-3.5 flex aspect-[16/10] w-full items-center justify-center overflow-hidden rounded-xl bg-bg-weak-50/40 p-3.5 text-text-strong-950 transition-colors duration-200 dark:bg-neutral-900/30 dark:text-white">
									{/* Top Right Circular Arrow Badge (visible on hover, stationary, no shadow) */}
									<div className="pointer-events-none absolute top-1 right-1 z-20 flex size-8 items-center justify-center rounded-full border border-stroke-soft-200/80 bg-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:border-white/15 dark:bg-neutral-900">
										<svg
											className="size-4 shrink-0 text-text-strong-950 dark:text-white"
											viewBox="0 0 16 16"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
											aria-hidden="true"
										>
											<path
												d="M4.5 11.5L11.5 4.5M11.5 4.5H5.5M11.5 4.5V10.5"
												stroke="currentColor"
												strokeWidth="1.5"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
										</svg>
									</div>

									{/* Subtle grey diagonal hatch pattern */}
									<div
										className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
										style={{
											backgroundImage:
												"repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 10px)",
										}}
									/>

									{/* Subtle grey concentric orbital & dotted rings */}
									<svg
										className="pointer-events-none absolute inset-0 size-full text-text-strong-950/[0.05] dark:text-white/[0.06]"
										viewBox="0 0 200 120"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
										aria-hidden="true"
									>
										<circle
											cx="100"
											cy="60"
											r="28"
											stroke="currentColor"
											strokeDasharray="3 3"
										/>
										<circle
											cx="100"
											cy="60"
											r="54"
											stroke="currentColor"
											strokeWidth="0.75"
										/>
										<circle
											cx="100"
											cy="60"
											r="82"
											stroke="currentColor"
											strokeDasharray="4 4"
										/>
									</svg>

									{/* Ultra subtle blue glow */}
									<div className="pointer-events-none absolute size-32 rounded-full bg-gradient-to-tr from-blue-500/[0.06] via-sky-400/[0.04] to-indigo-500/[0.04] blur-2xl transition-transform duration-500 group-hover:scale-125 dark:from-blue-500/[0.08] dark:via-sky-400/[0.06] dark:to-indigo-500/[0.06]" />

									<svg
										className="relative z-10 size-24 text-text-strong-950 transition-transform duration-200 ease-out group-hover:scale-105 dark:text-white"
										viewBox="0 0 24 24"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
										aria-hidden="true"
									>
										<g transform="rotate(90, 12, 12)">
											<g fill="none">
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
										</g>
									</svg>
								</div>

								{/* Text content below preview */}
								<div className="space-y-1.5 px-0.5">
									<h4 className="font-bold text-base text-text-strong-950 tracking-tight dark:text-white">
										Get started
									</h4>
									<p className="font-medium text-[13.5px] text-text-sub-600 leading-snug transition-colors duration-200 group-hover:text-text-strong-950 group-hover:underline group-hover:decoration-text-soft-400 group-hover:underline-offset-4 dark:text-white/60 dark:group-hover:text-white/90 dark:group-hover:decoration-white/30">
										Email API for developers. With agent inboxes built in.
									</p>
								</div>
							</a>
						</div>
					</aside>
				</div>
			</div>

			{/* CTA Section */}
			<BlogCta
				category={post.category}
				headline="Ship your first email with Reloop in minutes"
				sub="Open-source, deliverability-focused, and yours to self-host or run on Reloop Cloud. No lock-in, no rewrite later."
			/>
		</div>
	);
}
