import type { FeatureCtaLink } from "@reloop/web/components/landing/types";
import type React from "react";
import { getCompetitorByHref } from "../competitor-brands";
import { CompareHero } from "./compare-hero";

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
		<div className="relative mx-auto flex w-full max-w-5xl flex-col border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
			{/*
			 * Full-height frame: vertical rails span the entire page.
			 * Section content is constrained inside each CompareSection / component.
			 */}
			<CompareHero
				titleLines={titleLines}
				description={description}
				primaryCta={primaryCta}
				secondaryCta={secondaryCta}
				icon={brand?.icon}
			/>
			{children}
		</div>
	);
}
