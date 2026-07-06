import { createLandingMetadata } from "@reloop/web/lib/landing/metadata";
import { accentStyles } from "@reloop/web/lib/landing/page-accents";
import { useCaseConfigs } from "@reloop/web/lib/landing/use-cases";
import { getUseCaseEnrichment } from "@reloop/web/lib/landing/use-cases/enrichment";
import Link from "next/link";

export const instant = false;

export const metadata = createLandingMetadata(
	"Email Use Cases for Developers | Reloop",
	"Copy production-ready code for transactional alerts, drip flows, AI agent inboxes, and more. Every Reloop use case ships with a live flow diagram and working API snippet.",
	"/use-cases",
	[
		"email use cases",
		"transactional email",
		"marketing email API",
		"developer email workflows",
	],
);

export default function UseCasesIndexPage() {
	return (
		<div className="min-h-screen bg-white dark:bg-black">
			<div className="relative overflow-hidden border-stroke-soft-200 border-b bg-[#fafafa] pt-36 pb-24 sm:pt-48 sm:pb-36 dark:border-white/10 dark:bg-[#0a0a0a]">
				{/* Ambient Glow & Grid Accents */}
				<div className="pointer-events-none absolute inset-0 overflow-hidden">
					<div className="-translate-x-1/2 -translate-y-1/2 absolute top-0 left-1/2 h-[300px] w-[600px] rounded-full bg-gradient-to-r from-primary-base/15 via-violet-500/10 to-transparent blur-[80px] sm:h-[400px] sm:w-[800px] sm:blur-[120px] dark:from-primary-base/20 dark:via-violet-500/15" />
					<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />
				</div>

				<div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6">
					<h1 className="font-serif text-[2.2rem] text-text-strong-950 leading-[1.1] tracking-tight sm:text-[3.2rem] dark:text-white">
						Ship email faster
						<br />
						<span className="bg-gradient-to-r from-primary-base to-violet-500 bg-clip-text text-transparent dark:from-primary-base dark:to-violet-400">
							whatever the workflow
						</span>
					</h1>

					<p className="mx-auto mt-4 max-w-2xl text-[16px] text-text-sub-600 leading-relaxed sm:text-[18px] dark:text-white/60">
						Pick a scenario, copy the code, and go live. Every use case includes
						a flow diagram and a working API snippet — no boilerplate hunting.
					</p>
				</div>
			</div>

			<div className="mx-auto grid max-w-5xl gap-4 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
				{useCaseConfigs.map((uc) => {
					const extra = getUseCaseEnrichment(uc.slug);
					const accent = accentStyles[extra.accent];
					return (
						<Link
							key={uc.path}
							href={uc.path}
							className={`group rounded-2xl border border-stroke-soft-200 p-5 transition-colors dark:border-white/10 ${accent.hoverBorder} ${accent.hoverBg}`}
						>
							<span
								className={`inline-flex rounded-full px-2.5 py-0.5 font-semibold text-[10px] uppercase tracking-wider ${accent.badge}`}
							>
								{extra.metric.value}
							</span>
							<h2
								className={`mt-3 font-semibold text-[17px] text-text-strong-950 leading-snug transition-colors ${accent.groupHoverText} dark:text-white`}
							>
								{uc.titleLines.join(" ")}
							</h2>
							<p className="mt-2 text-[13px] text-text-sub-600 leading-relaxed dark:text-white/45">
								{uc.description}
							</p>
							<span
								className={`mt-4 inline-block font-semibold text-sm text-text-sub-600 transition-colors ${accent.groupHoverText} dark:text-white/45`}
							>
								View use case →
							</span>
						</Link>
					);
				})}
			</div>
		</div>
	);
}
