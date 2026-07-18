import { MarketingPageShell } from "@reloop/web/components/page-shell";
import type { FeatureCtaLink } from "@reloop/web/components/landing/types";
import type React from "react";
import { getCompetitorByHref } from "../competitor-brands";
import { CompareHeroIcons } from "./compare-hero-icons";

export function ComparisonPageShell({
	pagePath,
	titleLines,
	description,
	primaryCta,
	secondaryCta,
	children,
}: {
	pagePath: string;
	titleLines: string[];
	description?: string;
	primaryCta?: FeatureCtaLink;
	secondaryCta?: FeatureCtaLink;
	children: React.ReactNode;
}) {
	const brand = getCompetitorByHref(pagePath);

	return (
		<MarketingPageShell
			titleLines={titleLines}
			description={description}
			primaryCta={primaryCta}
			secondaryCta={secondaryCta}
			compactHero
			heroLeading={brand ? <CompareHeroIcons icon={brand.icon} /> : undefined}
		>
			{children}
		</MarketingPageShell>
	);
}
