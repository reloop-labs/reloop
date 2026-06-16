import { MarketingPageShell } from "@reloop/web/components/page-shell";
import type React from "react";
import { getCompetitorByHref } from "../competitor-brands";
import { CompareHeroIcons } from "./compare-hero-icons";

export function ComparisonPageShell({
	pagePath,
	titleLines,
	description,
	children,
}: {
	pagePath: string;
	titleLines: string[];
	description?: string;
	children: React.ReactNode;
}) {
	const brand = getCompetitorByHref(pagePath);

	return (
		<MarketingPageShell
			titleLines={titleLines}
			description={description}
			compactHero
			heroLeading={
				brand ? <CompareHeroIcons icon={brand.icon} /> : undefined
			}
		>
			{children}
		</MarketingPageShell>
	);
}
