import type { FeatureCtaLink } from "@reloop/web/components/landing/types";
import type React from "react";
import { getCompetitorByHref } from "../competitor-brands";
import { CompareHero } from "./compare-hero";

export function ComparisonPageShell({
	pagePath,
	titleLines,
	description,
	updatedAt,
	competitorName,
	children,
}: {
	pagePath: string;
	/** For competitors without an entry in competitor-brands (no brand icon yet). */
	competitorName?: string;
	titleLines: string[];
	/** Kept so existing compare pages can still pass hero copy. */
	description?: string;
	updatedAt?: string;
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
				competitorName={brand?.name ?? competitorName}
				icon={brand?.icon}
				description={description}
				updatedAt={updatedAt}
			/>
			{children}
		</div>
	);
}
