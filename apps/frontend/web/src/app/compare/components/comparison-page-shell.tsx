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
		<div className="relative">
			{/*
			 * Full-height dashed side rails at content max-width (1320px),
			 * from the top fold through the rest of the page body.
			 */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-y-0 left-1/2 z-30 hidden w-full max-w-[1320px] -translate-x-1/2 border-stroke-soft-200 border-x border-dashed sm:block dark:border-white/10"
			/>

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

			{children}
		</div>
	);
}
