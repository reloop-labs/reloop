"use client";

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
import Image from "next/image";
import Link from "next/link";
import { type ReactNode, useState } from "react";

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
			viewBox="0 0 16 16"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.75"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d="M6.5 9.5l3-3m-1.5-2l1.25-1.25a2.121 2.121 0 113 3L11 8.5m-3 1l-1.25 1.25a2.121 2.121 0 11-3-3L5 6.5" />
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
	const [email, setEmail] = useState("");

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
			<div className="mx-auto w-full max-w-5xl border-stroke-soft-200 border-x px-4 sm:px-6 md:max-w-7xl lg:px-8 pt-32 pb-16 dark:border-white/10">
				{/* Top Header Section */}
				<header className="mb-12 text-left border-b border-stroke-soft-200 dark:border-white/10 pb-10">
					<div className="flex flex-col gap-4 max-w-[680px] w-full">
						<Link
							href="/blog"
							className="text-text-sub-600 hover:text-text-strong-950 dark:text-white/60 dark:hover:text-white text-base/[150%] flex items-center gap-2.5 tracking-[-0.24px] font-medium mr-auto transition-colors"
						>
							<ArrowLeftIcon className="shrink-0 select-none text-text-strong-950 dark:text-white size-4.5" />
							<span>All articles</span>
						</Link>
						<div className="mt-6 flex items-center gap-2 font-mono font-medium text-xs/[150%] tracking-[0.6px] uppercase">
							<Link
								href={getCategoryPath(post.category)}
								className="text-primary-base hover:opacity-80 transition-opacity"
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
						<h1 className="text-text-strong-950 dark:text-white text-3xl sm:text-[40px] font-semibold leading-[110%] tracking-[-0.8px]">
							{post.title}
						</h1>
						<p className="text-text-sub-600 dark:text-white/60 text-xs/[150%] font-mono font-medium tracking-[0.6px] uppercase">
							{formatReadTimeUpper(post.readTime)}
						</p>
					</div>
				</header>

				{/* 3-Column Content Grid */}
				<div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
					{/* Left Column: Author Info & Share */}
					<aside className="lg:col-span-3 space-y-8">
						{/* Author Card */}
						<div className="flex items-center gap-3">
							{post.author.avatar ? (
								<Image
									src={post.author.avatar}
									alt={post.author.name}
									width={40}
									height={40}
									className="size-10 rounded-full object-cover shrink-0"
								/>
							) : (
								<div className="flex size-10 items-center justify-center rounded-full bg-neutral-900 text-white dark:bg-white/10 dark:text-white font-medium text-sm shrink-0">
									{post.author.name.charAt(0)}
								</div>
							)}
							<div>
								<p className="text-sm font-semibold text-text-strong-950 dark:text-white leading-snug">
									{post.author.name}
								</p>
								<p className="text-xs text-text-sub-600 dark:text-white/50">
									{post.author.role || "Engineering"}
								</p>
							</div>
						</div>

						{/* Share Article Section */}
						<div>
							<h3 className="font-mono text-[11px] text-text-sub-600 dark:text-white/45 tracking-widest uppercase font-medium mb-3">
								Share this article
							</h3>
							<div className="flex items-center gap-2">
								<a
									href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
									target="_blank"
									rel="noopener noreferrer"
									className="flex size-8 items-center justify-center rounded-full border border-stroke-soft-200 bg-bg-weak-50 text-[12px] font-bold text-text-sub-600 transition-colors hover:border-stroke-soft-300 hover:text-text-strong-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/70 dark:hover:border-white/20 dark:hover:text-white"
									aria-label="Share on LinkedIn"
								>
									in
								</a>
								<a
									href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
									target="_blank"
									rel="noopener noreferrer"
									className="flex size-8 items-center justify-center rounded-full border border-stroke-soft-200 bg-bg-weak-50 text-[12px] font-bold text-text-sub-600 transition-colors hover:border-stroke-soft-300 hover:text-text-strong-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/70 dark:hover:border-white/20 dark:hover:text-white"
									aria-label="Share on X"
								>
									✕
								</a>
								<a
									href={`https://news.ycombinator.com/submitlink?u=${shareUrl}&t=${shareTitle}`}
									target="_blank"
									rel="noopener noreferrer"
									className="flex size-8 items-center justify-center rounded-full border border-stroke-soft-200 bg-bg-weak-50 text-[12px] font-bold text-text-sub-600 transition-colors hover:border-stroke-soft-300 hover:text-text-strong-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/70 dark:hover:border-white/20 dark:hover:text-white"
									aria-label="Share on Hacker News"
								>
									Y
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
					</aside>

					{/* Center Column: Main Content */}
					<main className="lg:col-span-6 space-y-8">
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
								<div className="flex items-center gap-1.5 font-mono text-[11px] text-primary-base tracking-widest uppercase font-semibold mb-3">
									<SparklesIcon className="size-3" />
									<span>Summary</span>
								</div>
								<p className="text-[14px] sm:text-[15px] text-text-sub-600 leading-relaxed dark:text-white/70">
									{post.description}
								</p>
							</div>
						) : null}

						{/* Blog Article Body */}
						<BlogBody>{body}</BlogBody>
					</main>

					{/* Right Column: Table of Contents & Conversion Card */}
					<aside className="lg:col-span-3 space-y-8 lg:sticky lg:top-28">
						{/* Table of Contents */}
						{toc.length > 0 ? <BlogTableOfContents items={toc} /> : null}

						{/* Conversion Card */}
						<form
							onSubmit={(e) => {
								e.preventDefault();
								if (email) {
									window.location.href = `/auth/signup?email=${encodeURIComponent(email)}`;
								}
							}}
							className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50/80 p-3.5 space-y-2.5 dark:border-white/10 dark:bg-white/[0.03]"
						>
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="Email address"
								className="w-full rounded-lg border border-stroke-soft-200 bg-white px-3 py-2 text-[13px] text-text-strong-950 outline-none transition-colors placeholder:text-text-soft-400 focus:border-stroke-sub-300 dark:border-white/10 dark:bg-neutral-900/90 dark:text-white dark:placeholder:text-white/35 dark:focus:border-white/20"
							/>
							<button
								type="submit"
								className="w-full rounded-lg bg-text-strong-950 py-2 font-medium text-[13px] text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
							>
								Start for free
							</button>
							<Link
								href="/contact"
								className="block w-full rounded-lg border border-stroke-soft-200 bg-transparent py-2 text-center font-medium text-[13px] text-text-strong-950 transition-colors hover:bg-bg-weak-50 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
							>
								Contact sales
							</Link>
						</form>
					</aside>
				</div>
			</div>

			{/* CTA Section */}
			<BlogCta category={post.category} />
		</div>
	);
}
