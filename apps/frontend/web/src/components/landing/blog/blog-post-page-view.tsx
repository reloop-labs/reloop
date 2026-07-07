"use client";

import * as Button from "@reloop/ui/button";
import { ToolUpsell } from "@reloop/web/components/landing/tools/tool-chrome";
import type { FeatureCtaBand } from "@reloop/web/components/landing/types";
import type { BlogPostDefinition } from "@reloop/web/lib/landing/types";
import Link from "next/link";

export function BlogPostPageView({
	post,
	cta,
}: {
	post: BlogPostDefinition;
	cta: FeatureCtaBand;
}) {
	return (
		<div className="min-h-screen bg-white dark:bg-black">
			{/* Article layout — dev blog / Medium style */}
			<article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
				<nav className="mb-8 text-[13px] text-text-sub-600 dark:text-white/55">
					<Link href="/blog" className="hover:text-primary-base">
						Blog
					</Link>
					<span className="mx-2">/</span>
					<span>{post.tag}</span>
				</nav>

				<div className="mb-6 flex flex-wrap items-center gap-3 text-[13px] text-text-sub-600 dark:text-white/55">
					<span className="rounded-full bg-primary-base/10 px-3 py-1 font-semibold text-primary-base">
						{post.tag}
					</span>
					<time dateTime={post.publishedAt}>
						{new Date(post.publishedAt).toLocaleDateString("en-US", {
							year: "numeric",
							month: "long",
							day: "numeric",
						})}
					</time>
					<span>·</span>
					<span>{post.readTime}</span>
				</div>

				<h1 className="font-serif text-3xl text-text-strong-950 leading-tight tracking-tight sm:text-4xl dark:text-white">
					{post.title}
				</h1>
				<p className="mt-4 text-[18px] text-text-sub-600 leading-relaxed dark:text-white/55">
					{post.description}
				</p>

				<div className="my-10 border-stroke-soft-200 border-y py-1 dark:border-white/10" />

				<div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-serif prose-p:text-[17px] prose-p:leading-8">
					{post.sections.map((section) => (
						<div
							key={section.heading ?? section.paragraphs[0]}
							className="mb-10"
						>
							{section.heading && (
								<h2 className="font-serif text-2xl tracking-tight">
									{section.heading}
								</h2>
							)}
							{section.paragraphs.map((paragraph) => (
								<p key={paragraph.slice(0, 48)}>{paragraph}</p>
							))}
						</div>
					))}
				</div>

				<div className="mt-12 border-stroke-soft-200 border-t pt-8 dark:border-white/10">
					<Link
						href="/blog"
						className={Button.buttonVariants({
							mode: "stroke",
							variant: "neutral",
						}).root({
							className: "rounded-full",
						})}
					>
						← All posts
					</Link>
				</div>
			</article>

			<ToolUpsell
				title={cta.title}
				description={cta.description}
				primaryHref={cta.primary.href}
				primaryLabel={cta.primary.label}
				secondaryHref={cta.secondary?.href}
				secondaryLabel={cta.secondary?.label}
			/>
		</div>
	);
}
