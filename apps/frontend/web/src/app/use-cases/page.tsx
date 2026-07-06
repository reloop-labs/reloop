import { createLandingMetadata } from "@reloop/web/lib/landing/metadata";
import { accentStyles } from "@reloop/web/lib/landing/page-accents";
import { useCaseConfigs } from "@reloop/web/lib/landing/use-cases";
import { getUseCaseEnrichment } from "@reloop/web/lib/landing/use-cases/enrichment";
import Link from "next/link";

export const instant = false;

export const metadata = createLandingMetadata(
	"Email Use Cases",
	"Transactional, marketing, automated, AI agent, and inbound email use cases with Reloop.",
	"/use-cases",
	["email use cases", "transactional email", "marketing email API"],
);

export default function UseCasesIndexPage() {
	return (
		<div className="min-h-screen bg-white dark:bg-black">
			<div className="border-stroke-soft-200 border-b bg-[#fafafa] px-4 py-12 sm:px-6 dark:border-white/10 dark:bg-[#0a0a0a]">
				<div className="mx-auto max-w-5xl">
					<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em] dark:text-white/40">
						Use cases
					</p>
					<h1 className="mt-3 font-semibold text-3xl text-text-strong-950 tracking-tight dark:text-white">
						Every email scenario, one platform
					</h1>
					<p className="mt-3 max-w-2xl text-[16px] text-text-sub-600 leading-relaxed dark:text-white/50">
						Product-style pages with code samples and flow diagrams—like Stripe
						or SendGrid docs, not generic marketing.
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
							className={`group rounded-2xl border border-stroke-soft-200 p-5 transition-shadow hover:shadow-md dark:border-white/10 ${accent.ring} ring-1 ring-transparent`}
						>
							<span
								className={`inline-flex rounded-full px-2.5 py-0.5 font-semibold text-[10px] uppercase tracking-wider ${accent.badge}`}
							>
								{extra.metric.value}
							</span>
							<h2 className="mt-3 font-semibold text-[17px] text-text-strong-950 leading-snug group-hover:text-primary-base dark:text-white">
								{uc.titleLines.join(" ")}
							</h2>
							<p className="mt-2 text-[13px] text-text-sub-600 leading-relaxed dark:text-white/45">
								{uc.description}
							</p>
							<span
								className={`mt-4 inline-block font-semibold text-sm ${accent.text}`}
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
