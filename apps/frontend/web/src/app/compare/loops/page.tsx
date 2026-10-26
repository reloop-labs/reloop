import { getMigrationGuide } from "@reloop/web/lib/migration-guides";
import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import {
	costsCheckedAt,
	formatUsd,
	getCostSpotlight,
} from "../compare-hero-costs";
import { CompareFeatureGrid } from "../components/compare-feature-grid";
import { CompareFeaturesHeading } from "../components/compare-features-heading";
import { ComparePageJsonLd } from "../components/compare-json-ld";
import { CompareOtherPills } from "../components/compare-other-pills";
import { ComparisonPageShell } from "../components/comparison-page-shell";
import { loopsComparisonCategories } from "./comparison-data";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const pagePath = "/compare/loops";

/** Prices come from the same quotes as the hero card, so the copy never disagrees with it. */
const spotlight = getCostSpotlight("loops");
const heroDescription = spotlight
	? `Loops is hosted email for SaaS onboarding and marketing. Reloop is open source, and costs ${formatUsd(spotlight.reloop.usd)} a month at ${spotlight.volumeLabel.replace(" a month", "")}, Loops ${formatUsd(spotlight.competitor.usd)}.`
	: "Loops is hosted email for SaaS onboarding and marketing. Reloop is open source, with its own mail servers.";
const pageUrl = `${getSiteUrl()}${pagePath}`;

export const metadata: Metadata = {
	title: "Reloop vs Loops: Detailed Email Provider Comparison Report",
	description:
		"Learn how Reloop compares to Loops. Consolidate SaaS product onboarding, marketing broadcasts, and transactional APIs into one open-source platform without contact penalties.",
	keywords: [
		"Reloop vs Loops",
		"Loops alternative",
		"SaaS email comparison",
		"open source Loops alternative",
		"lifecycle email platform",
		"KumoMTA email API",
	],
	openGraph: {
		title: "Reloop vs Loops | Email Provider Comparison Report",
		description:
			"Learn how Reloop compares to Loops. Consolidate SaaS product onboarding, marketing broadcasts, and transactional APIs into one open-source platform without contact penalties.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Reloop vs Loops: Detailed Email Provider Comparison Report",
		description:
			"Learn how Reloop compares to Loops. Consolidate SaaS product onboarding, marketing broadcasts, and transactional APIs into one open-source platform without contact penalties.",
	},
	alternates: { canonical: pageUrl },
};

const LoopsComparisonPage = () => {
	const hasGuide = Boolean(getMigrationGuide("loops"));
	return (
		<>
			<ComparePageJsonLd slug="loops" withFaq={false} />
			<ComparisonPageShell
				pagePath={pagePath}
				titleLines={["Reloop vs Loops"]}
				description={heroDescription}
				updatedAt="October 27, 2026"
				primaryCta={{
					label: "Get Started ",
					href: "/dashboard/signup",
				}}
				secondaryCta={
					hasGuide
						? { label: "Migrate from Loops", href: "/migrate/loops" }
						: undefined
				}
				openSourceNote="Loops isn't open source: you can't run it on your own server."
				afterHero={
					<section className="border-stroke-soft-100 border-b dark:border-white/10">
						<CompareFeaturesHeading competitorName="Loops" />
						<CompareFeatureGrid
							competitorName="Loops"
							categories={loopsComparisonCategories}
						/>
					</section>
				}
			>
				<CompareOtherPills
					currentHref={pagePath}
					competitorName="Loops"
					sourceHost="loops.so"
					checkedOn={costsCheckedAt}
				/>
			</ComparisonPageShell>
		</>
	);
};

export default LoopsComparisonPage;
