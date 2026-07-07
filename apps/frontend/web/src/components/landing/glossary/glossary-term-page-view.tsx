"use client";

import * as Button from "@reloop/ui/button";
import { ToolUpsell } from "@reloop/web/components/landing/tools/tool-chrome";
import type { FeatureCtaBand } from "@reloop/web/components/landing/types";
import type { GlossaryTermDefinition } from "@reloop/web/lib/landing/types";
import Link from "next/link";

export function GlossaryTermPageView({
	term,
	cta,
}: {
	term: GlossaryTermDefinition;
	cta: FeatureCtaBand;
}) {
	return (
		<div className="min-h-screen bg-[#fafaf9] dark:bg-black">
			{/* Dictionary / MDN-style layout */}
			<div className="border-stroke-soft-200 border-b bg-white dark:border-white/10 dark:bg-[#0a0a0a]">
				<div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
					<nav className="text-[13px] text-text-sub-600 dark:text-white/55">
						<Link href="/glossary" className="hover:text-primary-base">
							Glossary
						</Link>
						<span className="mx-2">/</span>
						<span>{term.title}</span>
					</nav>
				</div>
			</div>

			<div className="mx-auto grid max-w-5xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_280px]">
				<article>
					<h1 className="font-serif text-4xl text-text-strong-950 tracking-tight dark:text-white">
						{term.title}
					</h1>
					<p className="mt-2 text-[17px] text-text-sub-600 italic dark:text-white/50">
						{term.description}
					</p>

					<div className="mt-8 rounded-xl border border-stroke-soft-200 bg-white p-8 dark:border-white/10 dark:bg-[#111]">
						<p className="text-[17px] text-text-strong-950 leading-8 dark:text-white/80">
							{term.body}
						</p>
					</div>

					{term.relatedFeatureHref &&
						(() => {
							const isCrossDomain =
								term.relatedFeatureHref.startsWith("/docs") ||
								term.relatedFeatureHref.startsWith("/dashboard");
							const className = Button.buttonVariants({
								variant: "neutral",
							}).root({
								className: "mt-4 rounded-full",
							});
							return (
								<div className="mt-8 rounded-xl border border-primary-base/20 bg-primary-base/5 p-6">
									<p className="font-semibold text-[14px] text-text-strong-950 dark:text-white">
										In Reloop
									</p>
									<p className="mt-2 text-[14px] text-text-sub-600 dark:text-white/50">
										See how Reloop helps you put {term.title} into practice in
										production.
									</p>
									{isCrossDomain ? (
										<a href={term.relatedFeatureHref} className={className}>
											View feature →
										</a>
									) : (
										<Link href={term.relatedFeatureHref} className={className}>
											View feature →
										</Link>
									)}
								</div>
							);
						})()}
				</article>

				<aside className="lg:sticky lg:top-24 lg:self-start">
					{term.relatedTerms && term.relatedTerms.length > 0 && (
						<div className="rounded-xl border border-stroke-soft-200 bg-white p-5 dark:border-white/10 dark:bg-[#111]">
							<p className="font-semibold text-[12px] text-text-sub-600 uppercase tracking-wider dark:text-white/55">
								Related terms
							</p>
							<ul className="mt-4 space-y-2">
								{term.relatedTerms.map((related) => (
									<li key={related.slug}>
										<Link
											href={`/glossary/${related.slug}`}
											className="text-[14px] text-primary-base hover:underline"
										>
											{related.title}
										</Link>
									</li>
								))}
							</ul>
						</div>
					)}
				</aside>
			</div>

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
