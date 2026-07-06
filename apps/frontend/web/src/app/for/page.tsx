import { createLandingMetadata } from "@reloop/web/lib/landing/metadata";
import { accentStyles } from "@reloop/web/lib/landing/page-accents";
import { personaConfigs } from "@reloop/web/lib/landing/personas";
import { getPersonaEnrichment } from "@reloop/web/lib/landing/personas/enrichment";
import Link from "next/link";

export const instant = false;

export const metadata = createLandingMetadata(
	"Who Reloop Is For",
	"Email infrastructure for developers, startups, SaaS, agencies, enterprises, and open-source projects.",
	"/for",
	["email for developers", "email for startups", "SaaS email platform"],
);

export default function ForIndexPage() {
	return (
		<div className="min-h-screen bg-white dark:bg-black">
			<div className="relative overflow-hidden border-stroke-soft-200 border-b px-4 py-14 sm:px-6 dark:border-white/10">
				<div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary-base/5 via-transparent to-violet-500/5" />
				<div className="relative mx-auto max-w-4xl text-center">
					<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em] dark:text-white/40">
						Audiences
					</p>
					<h1 className="mt-3 font-semibold text-3xl text-text-strong-950 tracking-tight dark:text-white">
						Built for your team
					</h1>
					<p className="mx-auto mt-3 max-w-2xl text-[16px] text-text-sub-600 leading-relaxed dark:text-white/50">
						Audience landing pages with pain points and wins—tailored to how
						each team evaluates email infrastructure.
					</p>
				</div>
			</div>

			<div className="mx-auto grid max-w-4xl gap-5 px-4 py-10 sm:grid-cols-2 sm:px-6">
				{personaConfigs.map((persona) => {
					const extra = getPersonaEnrichment(persona.slug);
					const accent = accentStyles[extra.accent];
					return (
						<Link
							key={persona.path}
							href={persona.path}
							className={`group rounded-2xl border border-stroke-soft-200 p-6 transition-colors dark:border-white/10 ${accent.hoverBorder}`}
						>
							<span
								className={`inline-flex rounded-full px-2.5 py-0.5 font-semibold text-[10px] uppercase tracking-wider ${accent.badge}`}
							>
								For {persona.titleLines.join(" ")}
							</span>
							<h2
								className={`mt-3 font-semibold text-[18px] text-text-strong-950 leading-snug transition-colors ${accent.groupHoverText} dark:text-white`}
							>
								{extra.headline}
							</h2>
							<p className="mt-2 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/45">
								{persona.description}
							</p>
							<ul className="mt-4 space-y-1.5">
								{extra.wins.slice(0, 2).map((win) => (
									<li key={win} className={`text-[13px] ${accent.text}`}>
										✓ {win}
									</li>
								))}
							</ul>
						</Link>
					);
				})}
			</div>
		</div>
	);
}
