import {
	FeatureCta,
	MarketingPageShell,
	PageSection,
	SectionHeading,
} from "@reloop/web/components/page-shell";
import type { AlternativeDefinition } from "@reloop/web/lib/landing/types";
import Link from "next/link";

export function AlternativeLandingPage({
	config,
}: {
	config: AlternativeDefinition;
}) {
	return (
		<MarketingPageShell
			titleLines={config.titleLines}
			description={config.description}
			primaryCta={config.primaryCta}
			secondaryCta={config.secondaryCta}
			compactHero
		>
			<PageSection flushTop narrow>
				<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
					Why teams choose Reloop over {config.competitorName}
				</p>
				<ul className="mt-6 space-y-4">
					{config.highlights.map((highlight) => (
						<li
							key={highlight}
							className="flex gap-3 text-[15px] text-text-sub-600 leading-relaxed dark:text-white/60"
						>
							<span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary-base" />
							{highlight}
						</li>
					))}
				</ul>
				<p className="mt-8 text-[14px] text-text-sub-600 dark:text-white/55">
					Want the full breakdown?{" "}
					<Link
						href={config.compareHref}
						className="font-semibold text-primary-base underline decoration-primary-base/30 underline-offset-4"
					>
						Read Reloop vs {config.competitorName}
					</Link>
				</p>
			</PageSection>

			{config.sections.map((section) => (
				<PageSection key={section.title} alt={section.alt}>
					<SectionHeading
						title={section.title}
						description={section.description}
					/>
					<div className="grid gap-6 md:grid-cols-3">
						{section.items.map((item) => (
							<div
								key={item.title}
								className="rounded-2xl border border-stroke-soft-200 bg-bg-weak-50 p-8 dark:border-white/10"
							>
								<h3 className="mb-3 font-semibold text-lg text-text-strong-950 dark:text-white">
									{item.title}
								</h3>
								<p className="text-sm text-text-sub-600 leading-relaxed dark:text-white/50">
									{item.description}
								</p>
							</div>
						))}
					</div>
				</PageSection>
			))}

			<FeatureCta {...config.cta} />
		</MarketingPageShell>
	);
}
