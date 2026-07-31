"use client";

import * as Button from "@reloop/ui/button";
import { FeatureCta } from "@reloop/web/components/landing/cta";
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
	const isCrossDomain =
		term.relatedFeatureHref?.startsWith("/docs") ||
		term.relatedFeatureHref?.startsWith("/dashboard");

	const featureCtaClass = Button.buttonVariants({
		variant: "neutral",
	}).root({
		className: "mt-5 rounded-full!",
	});

	return (
		<div className="mx-auto flex w-full max-w-5xl flex-col border-stroke-soft-200 border-x pt-6 pb-16 md:max-w-7xl dark:border-white/10">
			{/* Breadcrumb */}
			<div className="border-stroke-soft-200 border-b px-4 py-4 sm:px-6 lg:px-8 dark:border-white/10">
				<nav className="text-[13px] text-text-sub-600 dark:text-white/55">
					<Link
						href="/glossary"
						className="transition-colors hover:text-text-strong-950 dark:hover:text-white"
					>
						Glossary
					</Link>
					<span className="mx-2 text-text-sub-600/50 dark:text-white/30">
						/
					</span>
					<span className="text-text-strong-950 dark:text-white">
						{term.title}
					</span>
				</nav>
			</div>

			<div className="grid gap-0 lg:grid-cols-[1fr_280px]">
				<article className="min-w-0 px-4 py-10 sm:px-6 sm:py-12 lg:border-stroke-soft-200 lg:border-r lg:px-8 lg:py-14 dark:lg:border-white/10">
					<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em] dark:text-white/55">
						Definition
					</p>
					<h1 className="mt-3 font-serif text-[2.4rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3rem] dark:text-white">
						{term.title}
					</h1>
					<p className="mt-3 max-w-2xl text-[16px] text-text-sub-600 leading-relaxed sm:text-[17px] dark:text-white/55">
						{term.description}
					</p>

					<div className="mt-8 border-stroke-soft-200 border-t pt-8 dark:border-white/10">
						<p className="text-[16px] text-text-strong-950 leading-8 sm:text-[17px] dark:text-white/80">
							{term.body}
						</p>
					</div>

					{term.relatedFeatureHref && (
						<div className="mt-10 border-stroke-soft-200 border-t pt-8 dark:border-white/10">
							<p className="font-semibold text-[12px] text-text-sub-600 uppercase tracking-[0.16em] dark:text-white/55">
								In Reloop
							</p>
							<p className="mt-3 max-w-xl text-[15px] text-text-sub-600 leading-relaxed dark:text-white/55">
								See how Reloop helps you put {term.title} into practice in
								production.
							</p>
							{isCrossDomain ? (
								<a href={term.relatedFeatureHref} className={featureCtaClass}>
									View feature
								</a>
							) : (
								<Link href={term.relatedFeatureHref} className={featureCtaClass}>
									View feature
								</Link>
							)}
						</div>
					)}
				</article>

				<aside className="border-stroke-soft-200 border-t px-4 py-8 sm:px-6 lg:border-t-0 lg:px-6 lg:py-14 dark:border-white/10">
					{term.relatedTerms && term.relatedTerms.length > 0 ? (
						<div className="lg:sticky lg:top-24">
							<p className="font-semibold text-[12px] text-text-sub-600 uppercase tracking-[0.16em] dark:text-white/55">
								Related terms
							</p>
							<ul className="mt-4 divide-y divide-stroke-soft-200 border-stroke-soft-200 border-y dark:divide-white/10 dark:border-white/10">
								{term.relatedTerms.map((related) => (
									<li key={related.slug}>
										<Link
											href={`/glossary/${related.slug}`}
											className="flex items-center justify-between py-3.5 text-[14px] text-text-strong-950 transition-colors hover:text-primary-base dark:text-white"
										>
											{related.title}
											<span
												aria-hidden
												className="text-text-sub-600 dark:text-white/40"
											>
												→
											</span>
										</Link>
									</li>
								))}
							</ul>
							<Link
								href="/glossary"
								className="mt-5 inline-flex text-[13px] text-text-sub-600 underline decoration-text-sub-600/30 underline-offset-4 transition-colors hover:text-text-strong-950 dark:text-white/55 dark:hover:text-white"
							>
								Browse all terms
							</Link>
						</div>
					) : (
						<div className="lg:sticky lg:top-24">
							<p className="font-semibold text-[12px] text-text-sub-600 uppercase tracking-[0.16em] dark:text-white/55">
								Glossary
							</p>
							<p className="mt-3 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/55">
								Explore more email infrastructure terms.
							</p>
							<Link
								href="/glossary"
								className="mt-4 inline-flex text-[13px] text-text-strong-950 underline decoration-text-sub-600/40 underline-offset-4 transition-colors hover:text-primary-base dark:text-white"
							>
								Browse all terms
							</Link>
						</div>
					)}
				</aside>
			</div>

			<div className="border-stroke-soft-200 border-t dark:border-white/10">
				<FeatureCta
					title={cta.title}
					titleMuted={cta.titleMuted}
					description={cta.description}
					primary={cta.primary}
					secondary={cta.secondary}
					compact
				/>
			</div>
		</div>
	);
}
