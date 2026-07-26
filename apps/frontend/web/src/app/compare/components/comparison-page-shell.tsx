import type { FeatureCtaLink } from "@reloop/web/components/landing/types";
import { MarketingPageShell } from "@reloop/web/components/page-shell";
import type React from "react";
import { getCompetitorByHref } from "../competitor-brands";
import { CompareHeroIcons } from "./compare-hero-icons";
import { CompareStage } from "./compare-stage";

export function ComparisonPageShell({
	pagePath,
	titleLines,
	description,
	primaryCta,
	secondaryCta,
	children,
	/** Soft grid stage behind the hero (Dub-inspired). Default true. */
	stageHero = true,
}: {
	pagePath: string;
	titleLines: string[];
	description?: string;
	primaryCta?: FeatureCtaLink;
	secondaryCta?: FeatureCtaLink;
	children: React.ReactNode;
	stageHero?: boolean;
}) {
	const brand = getCompetitorByHref(pagePath);

	const brandPair = brand ? <CompareHeroIcons icon={brand.icon} /> : undefined;

	const heroLeading = stageHero ? (
		<div className="mb-8 sm:mb-10">
			<CompareStage>{brandPair}</CompareStage>
		</div>
	) : (
		brandPair
	);

	return (
		<div className="relative">
			{/*
			 * Full-height dashed side rails at the content max-width (1320px).
			 * Lives only around compare page content (inside <main>), so the
			 * site footer never gets the borders.
			 */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-y-0 left-1/2 z-30 hidden w-full max-w-[1320px] -translate-x-1/2 border-stroke-soft-200 border-x border-dashed sm:block dark:border-white/10"
			/>
			<MarketingPageShell
				titleLines={titleLines}
				description={description}
				primaryCta={primaryCta}
				secondaryCta={secondaryCta}
				compactHero
				heroLeading={heroLeading}
			>
				{children}
			</MarketingPageShell>
		</div>
	);
}
