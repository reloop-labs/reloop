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
		<div className="relative px-4 sm:px-6 lg:px-8">
			{/*
			 * Full-height frame: vertical rails span the entire page.
			 * Section content is constrained inside each CompareSection / component.
			 */}
			<div className="relative mx-auto w-full max-w-[1320px] border-stroke-soft-200 border-x border-dashed dark:border-white/10">
				{/*
				 * Full top fold lives inside the stage card (icons + title + copy + CTAs).
				 */}
				<CompareHero
					titleLines={titleLines}
					description={description}
					primaryCta={primaryCta}
					secondaryCta={secondaryCta}
					icon={brand?.icon}
				/>

				{/* Divider between hero and page body (e.g. Product UI) */}
				<div
					aria-hidden
					className="w-full border-stroke-soft-200 border-t border-dashed dark:border-white/10"
				/>

				{children}
			</div>
		</div>
	);
}
