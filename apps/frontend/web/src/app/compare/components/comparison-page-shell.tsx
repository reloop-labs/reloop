import type { FeatureCtaLink } from "@reloop/web/components/landing/types";
import { getBlogComparePage } from "@reloop/web/lib/blog-compare-pages";
import { getMigrationGuide } from "@reloop/web/lib/migration-guides";
import type React from "react";
import { SectionSeparator } from "../../(home)/components/section-separator";
import { getCostSpotlight } from "../compare-hero-costs";
import { getCompareSource } from "../compare-sources";
import { getCompetitorByHref } from "../competitor-brands";
import { CompareAgentsSection } from "./compare-agents-section";
import { CompareCostSection } from "./compare-cost-section";
import { CompareHero } from "./compare-hero";
import { CompareMigrateBanner } from "./compare-migrate-banner";
import { CompareOpenSourceSection } from "./compare-open-source-section";

/** How many rows of the written comparison the hero shows when there are no verified prices. */
const HIGHLIGHT_ROWS = 5;

export function ComparisonPageShell({
	pagePath,
	titleLines,
	description,
	competitorName,
	afterHero,
	openSourceNote,
	children,
}: {
	pagePath: string;
	titleLines: string[];
	/** Kept so existing compare pages can still pass hero copy. */
	description?: string;
	updatedAt?: string;
	/** For competitors without an entry in competitor-brands (no brand icon yet). */
	competitorName?: string;
	/** Rendered straight under the hero, above the price section. */
	afterHero?: React.ReactNode;
	/** One line on whether the competitor can be self-hosted, for "04 · Open source". */
	openSourceNote?: string;
	primaryCta?: FeatureCtaLink;
	secondaryCta?: FeatureCtaLink;
	children: React.ReactNode;
}) {
	const brand = getCompetitorByHref(pagePath);
	const slug = pagePath.replace("/compare/", "");
	const name = brand?.name ?? competitorName;
	const spotlight = getCostSpotlight(slug);
	const highlights = spotlight
		? undefined
		: getBlogComparePage(slug)?.features.slice(0, HIGHLIGHT_ROWS);

	return (
		<div className="relative mx-auto flex w-full max-w-5xl flex-col border-stroke-soft-100 border-x md:max-w-7xl dark:border-white/10">
			<CompareHero
				titleLines={titleLines}
				competitorName={name}
				icon={brand?.icon}
				description={description}
				spotlight={spotlight}
				source={name ? getCompareSource(name) : null}
				highlights={highlights}
				migrationHref={getMigrationGuide(slug) ? `/migrate/${slug}` : undefined}
			/>
			{afterHero ? (
				<>
					{afterHero}
					<SectionSeparator hideTop className="h-24 sm:h-24" />
				</>
			) : null}
			{name && spotlight ? (
				<>
					<CompareCostSection providerId={slug} competitorName={name} />
					<SectionSeparator hideTop className="h-24 sm:h-24" />
				</>
			) : null}
			{/* "03" only reads right after 01 · Features and 02 · Price, i.e. when features sit under the hero. */}
			{afterHero ? (
				<>
					<CompareAgentsSection />
					<SectionSeparator hideTop className="h-24 sm:h-24" />
					<CompareOpenSourceSection competitorNote={openSourceNote} />
					{/* Bands on both sides of the grey migration banner. */}
					{name && getMigrationGuide(slug) ? (
						<>
							<SectionSeparator hideTop className="h-24 sm:h-24" />
							<CompareMigrateBanner
								competitorName={name}
								icon={brand?.icon}
								guideHref={`/migrate/${slug}`}
							/>
							<SectionSeparator hideTop className="h-24 sm:h-24" />
						</>
					) : (
						<SectionSeparator hideTop className="h-24 sm:h-24" />
					)}
				</>
			) : null}
			{children}
		</div>
	);
}
