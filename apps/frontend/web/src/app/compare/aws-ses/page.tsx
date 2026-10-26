import { awsSesFeatures } from "@reloop/web/lib/compare-content";
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

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const pagePath = "/compare/aws-ses";

/** Prices come from the same quotes as the hero card, so the copy never disagrees with it. */
const spotlight = getCostSpotlight("aws-ses");
const heroDescription = spotlight
	? `Amazon SES is AWS's pay-per-email sending API, with no dashboard, templates or inbox on top. Reloop is open source, and costs ${formatUsd(spotlight.reloop.usd)} a month at ${spotlight.volumeLabel.replace(" a month", "")}, AWS SES ${formatUsd(spotlight.competitor.usd)}.`
	: "Amazon SES is AWS's pay-per-email sending API, with no dashboard, templates or inbox on top. Reloop is open source, with its own mail servers.";
const pageUrl = `${getSiteUrl()}${pagePath}`;

export const metadata: Metadata = {
	title: "Reloop vs AWS SES | Email Provider Comparison",
	description:
		"Learn how Reloop compares to Amazon SES and why Reloop is the best SES alternative for all your email delivery and platform needs.",
	keywords: [
		"Reloop vs AWS SES",
		"Amazon SES alternative",
		"AWS SES comparison",
		"SES email platform",
		"open source AWS SES alternative",
	],
	openGraph: {
		title: "Reloop vs AWS SES",
		description:
			"Learn how Reloop compares to Amazon SES and why Reloop is the best SES alternative for all your email delivery and platform needs.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Reloop vs AWS SES | Email Provider Comparison",
		description:
			"Learn how Reloop compares to Amazon SES and why Reloop is the best SES alternative for all your email delivery and platform needs.",
	},
	alternates: { canonical: pageUrl },
};

const AwsSesComparisonPage = () => {
	const hasGuide = Boolean(getMigrationGuide("aws-ses"));
	return (
		<>
			<ComparePageJsonLd slug="aws-ses" withFaq={false} />
			<ComparisonPageShell
				pagePath={pagePath}
				titleLines={["Reloop vs AWS SES"]}
				description={heroDescription}
				updatedAt="October 27, 2026"
				primaryCta={{
					label: "Get Started ",
					href: "/dashboard/signup",
				}}
				secondaryCta={
					hasGuide
						? { label: "Migrate from AWS SES", href: "/migrate/aws-ses" }
						: undefined
				}
				openSourceNote="AWS SES isn't open source: it only runs inside AWS."
				afterHero={
					<section className="border-stroke-soft-100 border-b dark:border-white/10">
						<CompareFeaturesHeading competitorName="AWS SES" />
						<CompareFeatureGrid
							competitorName="AWS SES"
							features={awsSesFeatures}
						/>
					</section>
				}
			>
				<CompareOtherPills
					currentHref={pagePath}
					competitorName="AWS SES"
					sourceHost="aws.amazon.com"
					checkedOn={costsCheckedAt}
				/>
			</ComparisonPageShell>
		</>
	);
};

export default AwsSesComparisonPage;
