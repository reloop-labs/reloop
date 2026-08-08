"use client";

import { Icon } from "@reloop/ui/icon";
import { BlogBody } from "@reloop/web/components/landing/blog/blog-body";
import { BlogCta } from "@reloop/web/components/landing/blog/blog-cta";
import { BlogPostCoverImage } from "@reloop/web/components/landing/blog/blog-post-cover-image";
import { BlogTableOfContents } from "@reloop/web/components/landing/blog/blog-table-of-contents";
import {
	formatBlogDateUpper,
	formatReadTimeUpper,
	getCategoryPath,
} from "@reloop/web/lib/landing/blog/utils";
import type {
	BlogPostDefinition,
	BlogTocItem,
} from "@reloop/web/lib/landing/types";
import * as FancyButton from "@reloop/ui/fancy-button";
import Image from "next/image";
import Link from "next/link";
import { type ReactNode, useState } from "react";
import { siYcombinator } from "simple-icons";

function ArrowLeftIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			viewBox="0 0 16 16"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
		>
			<path
				d="M8 0C3.589 0 0 3.589 0 8C0 12.411 3.589 16 8 16C12.411 16 16 12.411 16 8C16 3.589 12.411 0 8 0ZM11.25 8.75H6.561L7.781 9.97C8.074 10.263 8.074 10.738 7.781 11.031C7.635 11.177 7.443 11.251 7.251 11.251C7.059 11.251 6.867 11.178 6.721 11.031L4.221 8.531C3.928 8.238 3.928 7.763 4.221 7.47L6.721 4.97C7.014 4.677 7.489 4.677 7.782 4.97C8.075 5.263 8.075 5.738 7.782 6.031L6.562 7.251H11.251C11.665 7.251 12.001 7.587 12.001 8.001C12.001 8.415 11.665 8.751 11.251 8.751L11.25 8.75Z"
				fill="currentColor"
			/>
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
}: {
	post: BlogPostDefinition;
	body: ReactNode;
	toc: BlogTocItem[];
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
			{/* Main Article Container */}
			<div className="mx-auto w-full max-w-5xl border-stroke-soft-200 border-x px-4 pt-32 sm:px-6 md:max-w-7xl lg:px-8 dark:border-white/10">
				{/* Top Header Section */}
				<header className="-mx-4 border-stroke-soft-200 border-b pb-10 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 text-left dark:border-white/10">
					<div className="flex w-full max-w-[680px] flex-col gap-4">
						<Link
							href="/blog"
							className="mr-auto flex items-center gap-2.5 font-medium text-base/[150%] text-text-sub-600 tracking-[-0.24px] transition-colors hover:text-text-strong-950 dark:text-white/60 dark:hover:text-white"
						>
							<ArrowLeftIcon className="size-4.5 shrink-0 select-none text-text-strong-950 dark:text-white" />
							<span>All articles</span>
						</Link>
						<div className="mt-6 flex flex-wrap items-center gap-2 font-medium font-mono text-xs/[150%] uppercase tracking-[0.6px]">
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
							<span className="text-text-soft-400 dark:text-white/30">/</span>
							<span className="text-text-sub-600 dark:text-white/60">
								BY {post.author.name}
							</span>
						</div>
						<h1 className="font-semibold text-3xl text-text-strong-950 leading-[110%] tracking-[-0.8px] sm:text-[40px] dark:text-white">
							{post.title}
						</h1>
						<p className="font-medium font-mono text-text-sub-600 text-xs/[150%] uppercase tracking-[0.6px] dark:text-white/60">
							{formatReadTimeUpper(post.readTime)}
						</p>
					</div>
				</header>

				{/* 3-Column Content Grid */}
				<div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-0">
					{/* Left Column: Table of Contents */}
					<aside className="lg:col-span-3 lg:border-stroke-soft-200 lg:border-r lg:pt-10 lg:pb-16 lg:pr-8 dark:lg:border-white/10">
						<div className="space-y-8 lg:sticky lg:top-28">
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
								<p className="text-[14px] text-text-sub-600 leading-relaxed sm:text-[15px] dark:text-white/70">
									{post.description}
								</p>
							</div>
						) : null}

						{/* Blog Article Body */}
						<BlogBody>{body}</BlogBody>
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
											className="size-10 shrink-0 rounded-full object-cover"
										/>
									) : (
										<div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-neutral-900 font-medium text-sm text-white dark:bg-white/10 dark:text-white">
											{post.author.name === "Reloop Labs" ? (
												<Icon name="reloop" className="size-5 text-white" />
											) : (
												post.author.name.charAt(0)
											)}
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
								className="group relative block overflow-hidden rounded-2xl border border-stroke-soft-200 bg-white p-3.5 transition-all duration-200 hover:border-stroke-strong-950 hover:shadow-md dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/30"
							>
								{/* Top Product Preview Mockup */}
								<div className="relative mb-3.5 aspect-[16/10] w-full overflow-hidden rounded-xl border border-stroke-soft-200/80 bg-gradient-to-b from-bg-weak-50 via-white to-bg-weak-50/50 p-3.5 dark:border-white/10 dark:from-neutral-900 dark:via-neutral-900/80 dark:to-neutral-950">
									{/* Subtle grid pattern background */}
									<div
										className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.08]"
										style={{
											backgroundImage:
												"linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
											backgroundSize: "16px 16px",
										}}
									/>

									{/* Top Bar inside preview */}
									<div className="relative z-10 flex items-center justify-between">
										<div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-mono font-medium text-[10px] text-emerald-600 dark:text-emerald-400">
											<span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
											99.99% Delivered
										</div>
										<div className="flex items-center gap-1 rounded-md border border-stroke-soft-200 bg-white/80 px-2 py-0.5 font-mono text-[10px] text-text-sub-600 dark:border-white/10 dark:bg-white/10 dark:text-white/60">
											<span>SMTP / API</span>
										</div>
									</div>

									{/* Center Wordmark & Visual Elements */}
									<div className="relative z-10 my-auto flex flex-col items-center justify-center py-2">
										<div className="flex items-center gap-2">
											<div className="flex size-7 items-center justify-center rounded-lg bg-text-strong-950 text-white shadow-sm transition-transform duration-200 group-hover:scale-105 dark:bg-white dark:text-black">
												<Icon name="reloop" className="size-4" />
											</div>
											<span className="font-bold font-sans text-lg text-text-strong-950 tracking-tight dark:text-white">
												reloop
											</span>
										</div>
									</div>

									{/* Bottom Mini Code / Card Widget */}
									<div className="relative z-10 rounded-lg border border-stroke-soft-200 bg-white/90 p-2 shadow-xs transition-transform duration-200 group-hover:translate-y-[-2px] dark:border-white/10 dark:bg-neutral-900/90">
										<div className="flex items-center justify-between font-mono text-[11px]">
											<span className="flex items-center gap-1.5 text-text-strong-950 dark:text-white">
												<span className="text-emerald-500 font-bold">POST</span> /v1/emails/send
											</span>
											<span className="rounded bg-emerald-500/10 px-1.5 py-0.5 font-semibold text-[9px] text-emerald-600 dark:text-emerald-400">
												200 OK
											</span>
										</div>
									</div>
								</div>

								{/* Text content below preview */}
								<div className="space-y-1 px-0.5">
									<h4 className="flex items-center justify-between font-bold text-base text-text-strong-950 tracking-tight dark:text-white">
										<span>Try Reloop for free</span>
										<svg
											className="size-4 text-text-sub-600 transition-transform duration-200 group-hover:translate-x-0.5 dark:text-white/60"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
											strokeWidth={2}
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M9 5l7 7-7 7"
											/>
										</svg>
									</h4>
									<p className="text-[13px] text-text-sub-600 leading-snug dark:text-white/60">
										Supercharge your application with Reloop's developer-first email infrastructure platform
									</p>
								</div>
							</a>
						</div>
					</aside>
				</div>
			</div>

			{/* CTA Section */}
			<BlogCta category={post.category} />
		</div>
	);
}
