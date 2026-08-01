import type { FeatureCtaBand } from "@reloop/web/components/landing/types";
import type { GlossaryTermDefinition } from "@reloop/web/lib/landing/types";
import Link from "next/link";
import type { ReactNode } from "react";

const rail =
	"mx-auto w-full max-w-5xl border-stroke-soft-200 border-x dark:border-white/10";

function isCrossDomain(href: string) {
	return href.startsWith("/docs") || href.startsWith("/dashboard");
}

function FeatureLink({
	href,
	className,
	children,
}: {
	href: string;
	className: string;
	children: ReactNode;
}) {
	if (isCrossDomain(href)) {
		return (
			<a href={href} className={className}>
				{children}
			</a>
		);
	}
	return (
		<Link href={href} className={className}>
			{children}
		</Link>
	);
}

export function GlossaryTermPageView({
	term,
	cta,
}: {
	term: GlossaryTermDefinition;
	cta: FeatureCtaBand;
}) {
	const initial = term.title.trim().charAt(0).toUpperCase() || "#";

	return (
		<div className="pb-16 pt-6">
			{/* Breadcrumb */}
			<div className={rail}>
				<nav
					aria-label="Breadcrumb"
					className="flex items-center gap-2 border-stroke-soft-200 border-b px-4 py-4 text-[13px] text-text-sub-600 sm:px-6 lg:px-8 dark:border-white/10 dark:text-white/55"
				>
					<Link
						href="/glossary"
						className="transition-colors hover:text-text-strong-950 dark:hover:text-white"
					>
						Glossary
					</Link>
					<span className="text-text-sub-600/40 dark:text-white/25" aria-hidden>
						/
					</span>
					<span className="font-medium text-text-strong-950 dark:text-white">
						{term.title}
					</span>
				</nav>
			</div>

			{/* Term header */}
			<header className={rail}>
				<div className="flex items-start gap-5 px-4 py-10 sm:gap-8 sm:px-6 sm:py-12 lg:gap-10 lg:px-8 lg:py-14">
					{/* Outline initial — matches index letter style */}
					<span
						aria-hidden
						className="mt-1 select-none font-sans font-light text-[3.5rem] leading-none tracking-tight text-transparent sm:text-[4.5rem] lg:text-[5rem] [-webkit-text-stroke:1.25px_#a3a3a3] dark:[-webkit-text-stroke:1.25px_rgba(255,255,255,0.35)]"
					>
						{initial}
					</span>
					<div className="min-w-0 flex-1 pt-1 sm:pt-2">
						<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em] dark:text-white/55">
							Definition
						</p>
						<h1 className="mt-2 font-serif text-[2.2rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[2.8rem] lg:text-[3.2rem] dark:text-white">
							{term.title}
						</h1>
						<p className="mt-3 max-w-2xl text-[16px] text-text-sub-600 leading-relaxed sm:text-[17px] dark:text-white/55">
							{term.description}
						</p>
					</div>
				</div>
			</header>

			{/* Body */}
			<section className={rail}>
				<div className="border-stroke-soft-200 border-t bg-bg-weak-50/60 px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14 dark:border-white/10 dark:bg-white/[0.02]">
					<div className="mx-auto max-w-2xl">
						<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em] dark:text-white/55">
							In detail
						</p>
						<p className="mt-4 text-[16px] text-text-strong-950 leading-[1.8] sm:text-[17px] dark:text-white/80">
							{term.body}
						</p>
					</div>
				</div>
			</section>

			{/* In Reloop */}
			{term.relatedFeatureHref && (
				<section className={rail}>
					<div className="border-stroke-soft-200 border-t px-4 py-8 sm:px-6 sm:py-10 lg:px-8 dark:border-white/10">
						<div className="flex flex-col gap-5 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7 dark:border-white/10 dark:bg-[#111]">
							<div className="min-w-0 max-w-xl">
								<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em] dark:text-white/55">
									In Reloop
								</p>
								<p className="mt-2 text-[15px] text-text-sub-600 leading-relaxed dark:text-white/55">
									See how Reloop helps you put{" "}
									<span className="font-medium text-text-strong-950 dark:text-white">
										{term.title}
									</span>{" "}
									into practice in production.
								</p>
							</div>
							<FeatureLink
								href={term.relatedFeatureHref}
								className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-[#0a0d12] px-6 font-semibold text-[14px] text-white transition-colors hover:bg-[#0a0d12]/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
							>
								View feature
							</FeatureLink>
						</div>
					</div>
				</section>
			)}

			{/* Related terms */}
			<section className={rail}>
				<div className="border-stroke-soft-200 border-t px-4 py-10 sm:px-6 sm:py-12 lg:px-8 dark:border-white/10">
					<div className="flex flex-wrap items-end justify-between gap-3">
						<div>
							<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em] dark:text-white/55">
								Keep learning
							</p>
							<h2 className="mt-2 font-serif text-[1.75rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[2rem] dark:text-white">
								Related terms
							</h2>
						</div>
						<Link
							href="/glossary"
							className="text-[13px] text-text-sub-600 underline decoration-text-sub-600/30 underline-offset-4 transition-colors hover:text-text-strong-950 dark:text-white/55 dark:hover:text-white"
						>
							Browse all terms
						</Link>
					</div>

					{term.relatedTerms && term.relatedTerms.length > 0 ? (
						<ul className="mt-6 grid gap-3 sm:grid-cols-2">
							{term.relatedTerms.map((related) => (
								<li key={related.slug}>
									<Link
										href={`/glossary/${related.slug}`}
										className="group flex items-center justify-between gap-4 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 px-5 py-4 transition-colors hover:bg-bg-weak-50 dark:border-white/10 dark:bg-[#111] dark:hover:bg-white/[0.04]"
									>
										<span className="font-semibold text-[15px] text-text-strong-950 dark:text-white">
											{related.title}
										</span>
										<span
											aria-hidden
											className="text-text-sub-600 transition-transform duration-200 group-hover:translate-x-0.5 dark:text-white/40"
										>
											→
										</span>
									</Link>
								</li>
							))}
						</ul>
					) : (
						<p className="mt-4 text-[15px] text-text-sub-600 dark:text-white/55">
							Explore more email infrastructure terms in the glossary.
						</p>
					)}
				</div>
			</section>

			{/* CTA */}
			<section id="cta" className={rail}>
				<div className="border-stroke-soft-200 border-t px-4 py-14 sm:px-6 sm:py-16 lg:px-8 dark:border-white/10">
					<div className="mx-auto max-w-[920px] text-center">
						<h2 className="font-serif text-[2.2rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[2.8rem] lg:text-[3.2rem] dark:text-white">
							{cta.title}
							{cta.titleMuted && (
								<>
									<br />
									<span className="text-primary-base">{cta.titleMuted}</span>
								</>
							)}
						</h2>
						<p className="mx-auto mt-5 max-w-[550px] font-medium text-[15px] text-text-sub-600 leading-7 sm:text-[16px] dark:text-white/60">
							{cta.description}
						</p>
						<div className="mt-8 flex flex-wrap items-center justify-center gap-4">
							<FeatureLink
								href={cta.primary.href}
								className="inline-flex h-12 items-center justify-center rounded-full bg-[#0a0d12] px-8 font-semibold text-[15px] text-white transition-colors hover:bg-[#0a0d12]/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
							>
								{cta.primary.label}
							</FeatureLink>
							{cta.secondary && (
								<FeatureLink
									href={cta.secondary.href}
									className="inline-flex h-12 items-center justify-center rounded-full border border-[#0a0d12]/10 px-8 font-semibold text-[#0a0d12] text-[15px] transition-colors hover:bg-[#0a0d12]/10 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
								>
									{cta.secondary.label}
								</FeatureLink>
							)}
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
