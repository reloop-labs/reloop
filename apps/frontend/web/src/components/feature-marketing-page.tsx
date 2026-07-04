import type {
	FeatureCtaBand,
	FeatureCtaLink,
} from "@reloop/web/components/landing/types";
import {
	cardGridClass,
	FeatureCta,
	MarketingPageShell,
	PageSection,
	SectionHeading,
} from "@reloop/web/components/page-shell";
import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";

export type FeatureMarketingSection = {
	title: string;
	description?: string;
	alt?: boolean;
	items: { title: string; description: string }[];
};

export type FeatureMarketingPageConfig = {
	titleLines: string[];
	description: string;
	primaryCta: FeatureCtaLink;
	secondaryCta?: FeatureCtaLink;
	sections: FeatureMarketingSection[];
	cta: FeatureCtaBand;
};

export function FeatureMarketingPage({
	config,
}: {
	config: FeatureMarketingPageConfig;
}) {
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
			<FeatureCta {...config.cta} />
		</MarketingPageShell>
	);
}

export function featurePageMetadata(
	title: string,
	description: string,
	options?: {
		keywords?: string[];
		/** Route path, e.g. "/features/webhooks". Auto-generates canonical URL. */
		path?: string;
	},
): Metadata {
	const fullTitle = `${title} | Reloop`;
	const canonicalUrl = options?.path
		? `${getSiteUrl()}${options.path}`
		: undefined;

	return {
		title: fullTitle,
		description,
		keywords: options?.keywords,
		alternates: canonicalUrl ? { canonical: canonicalUrl } : undefined,
		openGraph: {
			title: fullTitle,
			description,
			type: "website",
			...(canonicalUrl && { url: canonicalUrl }),
			siteName: "Reloop",
		},
		twitter: {
			card: "summary_large_image",
			title: fullTitle,
			description,
		},
	};
}
