import { JsonLd } from "@reloop/web/components/json-ld";
import { FeatureCta } from "@reloop/web/components/landing/cta";
import type { FeatureCtaBand } from "@reloop/web/components/landing/types";
import { buildGlossaryTermJsonLd } from "@reloop/web/lib/landing/glossary/seo";
import type { GlossaryTermDefinition } from "@reloop/web/lib/landing/types";
import Link from "next/link";
import type { ReactNode } from "react";

const rail =
	"mx-auto w-full max-w-7xl border-stroke-soft-200 border-x dark:border-white/10";

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

/** Letter column + content row so definition and detail share one left edge. */
const contentRow =
	"flex items-start gap-5 px-4 sm:gap-8 sm:px-6 lg:gap-10 lg:px-8";
const letterGutter =
	"mt-1 w-[1.15em] shrink-0 select-none text-center font-light font-sans text-[3.5rem] leading-none tracking-tight sm:w-[1.1em] sm:text-[4.5rem] lg:text-[5rem]";

export function GlossaryTermPageView({
	term,
	cta,
}: {
	term: GlossaryTermDefinition;
	cta: FeatureCtaBand;
}) {
	const initial = term.title.trim().charAt(0).toUpperCase() || "#";
	const jsonLd = buildGlossaryTermJsonLd(term);

	return (
		<article itemScope itemType="https://schema.org/DefinedTerm">
			<JsonLd data={jsonLd} />
			{/* Breadcrumb  -  Home + Glossary for crawlable internal links */}
			<div className={rail}>
				<nav
					aria-label="Breadcrumb"
					className="flex flex-wrap items-center gap-2 border-stroke-soft-200 border-b px-4 py-4 text-[13px] text-text-sub-600 sm:px-6 lg:px-8 dark:border-white/10 dark:text-white/55"
				>
					<Link
						href="/"
						className="transition-colors hover:text-text-strong-950 dark:hover:text-white"
					>
						Home
					</Link>
					<span className="text-text-sub-600/40 dark:text-white/25" aria-hidden>
						/
					</span>
					<Link
						href="/glossary"
						className="transition-colors hover:text-text-strong-950 dark:hover:text-white"
					>
						Email Glossary
					</Link>
					<span className="text-text-sub-600/40 dark:text-white/25" aria-hidden>
						/
					</span>
					<span
						className="font-medium text-text-strong-950 dark:text-white"
						itemProp="name"
					>
						{term.title}
					</span>
				</nav>
			</div>

			{/* Term header */}
			<header className={rail}>
				<div className={`${contentRow} py-10 sm:py-12 lg:py-14`}>
					<span
						aria-hidden
						className={`${letterGutter} text-transparent [-webkit-text-stroke:1.25px_#a3a3a3] dark:[-webkit-text-stroke:1.25px_rgba(255,255,255,0.35)]`}
					>
						{initial}
					</span>
					<div className="min-w-0 flex-1 pt-1 sm:pt-2">
						<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em] dark:text-white/55">
							Definition
						</p>
						<h1 className="mt-2 font-sans font-semibold text-[2.2rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[2.8rem] lg:text-[3.2rem] dark:text-white">
							{term.title}
						</h1>
						<p
							className="mt-3 max-w-2xl text-[16px] text-text-sub-600 leading-relaxed sm:text-[17px] dark:text-white/55"
							itemProp="description"
						>
							{term.description}
						</p>
					</div>
				</div>
			</header>

			{/* Body  -  same letter gutter as definition so copy lines up */}
			<section className={rail} aria-labelledby="glossary-detail-heading">
				<div className="border-stroke-soft-200 border-y bg-bg-weak-50/60 py-10 sm:py-12 lg:py-14 dark:border-white/10 dark:bg-white/[0.02]">
					<div className={contentRow}>
						<span aria-hidden className={`${letterGutter} invisible`}>
							{initial}
						</span>
						<div className="min-w-0 max-w-2xl flex-1 pt-1 sm:pt-2">
							<h2
								id="glossary-detail-heading"
								className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em] dark:text-white/55"
							>
								In detail
							</h2>
							<div className="mt-4 space-y-4">
								{term.body
									.split(/\n\n+/)
									.map((paragraph) => paragraph.trim())
									.filter(Boolean)
									.map((paragraph) => (
										<p
											key={paragraph.slice(0, 48)}
											className="text-[16px] text-text-strong-950 leading-[1.8] sm:text-[17px] dark:text-white/80"
										>
											{paragraph}
										</p>
									))}
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* In Reloop  -  clear gap after detail border (no gray bg), then hatch band */}
			{term.relatedFeatureHref && (
				<section className={rail}>
					{/* Empty space: page bg only, no fill */}
					<div className="h-10 bg-transparent sm:h-12" aria-hidden />

					<div className="grid w-full grid-cols-1 items-stretch border-stroke-soft-200 border-y bg-bg-white-0 sm:grid-cols-[minmax(2rem,1fr)_minmax(0,56rem)_minmax(2rem,1fr)] lg:grid-cols-[minmax(2.5rem,1fr)_minmax(0,64rem)_minmax(2.5rem,1fr)] dark:border-white/10 dark:bg-black">
						{/* Left hatch */}
						<div
							aria-hidden
							className="hidden min-h-[1px] self-stretch border-stroke-soft-200 border-r bg-transparent text-text-strong-950/15 sm:block dark:border-white/10 dark:text-white/15"
							style={{
								backgroundImage:
									"repeating-linear-gradient(-45deg, transparent 0, transparent 5px, currentColor 5px, currentColor 6.5px)",
							}}
						/>

						{/* Center CTA cell */}
						<div className="flex min-w-0 flex-col justify-between gap-6 bg-bg-white-0 px-5 py-8 sm:flex-row sm:items-center sm:gap-8 sm:border-stroke-soft-200 sm:border-x sm:px-7 sm:py-9 lg:px-8 dark:bg-black dark:sm:border-white/10">
							<div className="min-w-0">
								<p className="font-semibold text-[13px] text-text-strong-950 sm:text-[15px] dark:text-white">
									In Reloop
								</p>
								<p className="mt-1.5 max-w-5xl text-[13px] text-text-sub-600 leading-relaxed sm:text-[14px] dark:text-white/55">
									How{" "}
									<span className="text-text-strong-950 dark:text-white/80">
										{term.title}
									</span>{" "}
									shows up when you use Reloop, hosted or self-hosted.
								</p>
							</div>
							<FeatureLink
								href={term.relatedFeatureHref}
								className="group inline-flex shrink-0 items-center gap-1.5 font-semibold text-[14px] text-text-strong-950 transition-colors hover:text-primary-base dark:text-white"
							>
								View feature
								<span
									aria-hidden
									className="transition-transform duration-200 group-hover:translate-x-0.5"
								>
									→
								</span>
							</FeatureLink>
						</div>

						{/* Right hatch */}
						<div
							aria-hidden
							className="hidden min-h-[1px] self-stretch border-stroke-soft-200 border-l bg-transparent text-text-strong-950/15 sm:block dark:border-white/10 dark:text-white/15"
							style={{
								backgroundImage:
									"repeating-linear-gradient(-45deg, transparent 0, transparent 5px, currentColor 5px, currentColor 6.5px)",
							}}
						/>
					</div>

					{/* Empty space below In Reloop (no fill) */}
					<div className="h-10 bg-transparent sm:h-12" aria-hidden />
				</section>
			)}

			{/* Related terms  -  numbered grid (Attio-style cells) */}
			<section className={rail}>
				{/* When In Reloop is missing, still clear the detail band */}
				{!term.relatedFeatureHref && (
					<div className="h-10 bg-transparent sm:h-12" aria-hidden />
				)}

				<div className="border-stroke-soft-200 border-y dark:border-white/10">
					<div className="px-4 py-10 text-center sm:px-6 sm:py-12 lg:px-8">
						<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em] dark:text-white/55">
							Related
						</p>
						<h2 className="mt-2 font-sans font-semibold text-[1.75rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[2.2rem] dark:text-white">
							Nearby terms
						</h2>
						<p className="mx-auto mt-3 max-w-md text-[15px] text-text-sub-600 leading-relaxed dark:text-white/55">
							Other words that often show up next to {term.title}.
						</p>
					</div>

					{term.relatedTerms && term.relatedTerms.length > 0 ? (
						<ul
							className={[
								"grid gap-px border-stroke-soft-200 border-t bg-stroke-soft-200 dark:border-white/10 dark:bg-white/10",
								term.relatedTerms.length === 1 && "grid-cols-1",
								term.relatedTerms.length === 2 && "grid-cols-1 sm:grid-cols-2",
								term.relatedTerms.length === 3 && "grid-cols-1 sm:grid-cols-3",
								term.relatedTerms.length >= 4 &&
									"grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
							]
								.filter(Boolean)
								.join(" ")}
						>
							{term.relatedTerms.map((related, index) => {
								const n = String(index + 1).padStart(2, "0");
								return (
									<li
										key={related.slug}
										className="bg-bg-white-0 dark:bg-black"
									>
										<Link
											href={`/glossary/${related.slug}`}
											title={`${related.title}  -  email glossary definition`}
											className="group flex h-full flex-col justify-between gap-4 px-5 py-4 transition-colors hover:bg-bg-weak-50 sm:px-6 sm:py-5 dark:hover:bg-white/[0.03]"
										>
											<span className="font-medium text-[12px] text-text-sub-600 tabular-nums tracking-wide dark:text-white/40">
												[{n}]
											</span>
											<span className="font-medium text-[16px] text-text-strong-950 leading-snug transition-colors group-hover:text-primary-base sm:text-[17px] dark:text-white">
												{related.title}
											</span>
										</Link>
									</li>
								);
							})}
						</ul>
					) : (
						<div className="border-stroke-soft-200 border-t px-4 py-10 text-center sm:px-6 dark:border-white/10">
							<p className="text-[15px] text-text-sub-600 dark:text-white/55">
								See the full list of email terms in the glossary.
							</p>
							<Link
								href="/glossary"
								className="mt-3 inline-flex text-[13px] text-text-strong-950 underline decoration-text-sub-600/30 underline-offset-4 transition-colors hover:text-primary-base dark:text-white"
							>
								Browse all terms
							</Link>
						</div>
					)}

					{term.relatedTerms && term.relatedTerms.length > 0 && (
						<div className="border-stroke-soft-200 border-t px-4 py-5 text-center sm:px-6 dark:border-white/10">
							<Link
								href="/glossary"
								className="text-[13px] text-text-sub-600 underline decoration-text-sub-600/30 underline-offset-4 transition-colors hover:text-text-strong-950 dark:text-white/55 dark:hover:text-white"
							>
								Browse all terms
							</Link>
						</div>
					)}
				</div>

				{/* Empty space below related terms before CTA */}
				<div className="h-10 bg-transparent sm:h-12" aria-hidden />
			</section>

			{/* CTA */}
			<FeatureCta {...cta} compact />
		</article>
	);
}
