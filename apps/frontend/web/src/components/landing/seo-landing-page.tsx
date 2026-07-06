import {
	cardGridClass,
	FeatureCta,
	MarketingPageShell,
	PageSection,
	SectionHeading,
} from "@reloop/web/components/page-shell";
import type { LandingPageDefinition } from "@reloop/web/lib/landing/types";
import Link from "next/link";

export function SeoLandingPage({ config }: { config: LandingPageDefinition }) {
	return (
		<MarketingPageShell
			titleLines={config.titleLines}
			description={config.description}
			primaryCta={config.primaryCta}
			secondaryCta={config.secondaryCta}
		>
			{config.sections.map((section) => (
				<PageSection key={section.title} alt={section.alt}>
					<SectionHeading
						title={section.title}
						description={section.description}
					/>
					<div className={cardGridClass}>
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

			{config.relatedLinks && config.relatedLinks.length > 0 && (
				<PageSection alt narrow>
					<SectionHeading title="Related" compact center />
					<ul className="flex flex-wrap justify-center gap-3">
						{config.relatedLinks.map((link) => (
							<li key={link.href}>
								<Link
									href={link.href}
									className="rounded-full border border-stroke-soft-200 px-4 py-2 text-sm text-text-sub-600 transition-colors hover:border-primary-base hover:text-primary-base dark:border-white/10 dark:text-white/60"
								>
									{link.label}
								</Link>
							</li>
						))}
					</ul>
				</PageSection>
			)}

			<FeatureCta {...config.cta} />
		</MarketingPageShell>
	);
}
