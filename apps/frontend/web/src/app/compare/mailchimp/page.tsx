import { mailchimpFeatures } from "@reloop/web/lib/compare-content";
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

const pagePath = "/compare/mailchimp";

/** Prices come from the same quotes as the hero card, so the copy never disagrees with it. */
const spotlight = getCostSpotlight("mailchimp");
const heroDescription = spotlight
	? `Mailchimp is a hosted marketing email platform, priced by contacts. Reloop is open source, and costs ${formatUsd(spotlight.reloop.usd)} a month at ${spotlight.volumeLabel.replace(" a month", "")}, Mailchimp ${formatUsd(spotlight.competitor.usd)}.`
	: "Mailchimp is a hosted marketing email platform, priced by contacts. Reloop is open source, with its own mail servers.";
const pageUrl = `${getSiteUrl()}${pagePath}`;

export const metadata: Metadata = {
	title: "Reloop vs Mailchimp | Email Provider Comparison",
	description:
		"Learn how Reloop compares to Mailchimp and why Reloop is the best Mailchimp alternative for all your product and marketing email needs.",
	keywords: [
		"Reloop vs Mailchimp",
		"Mailchimp alternative",
		"newsletter platform comparison",
		"email marketing comparison",
		"open source Mailchimp alternative",
	],
	openGraph: {
		title: "Reloop vs Mailchimp",
		description:
			"Learn how Reloop compares to Mailchimp and why Reloop is the best Mailchimp alternative for all your product and marketing email needs.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Reloop vs Mailchimp | Email Provider Comparison",
		description:
			"Learn how Reloop compares to Mailchimp and why Reloop is the best Mailchimp alternative for all your product and marketing email needs.",
	},
	alternates: { canonical: pageUrl },
};

const MailchimpComparisonPage = () => {
	const hasGuide = Boolean(getMigrationGuide("mailchimp"));
	return (
		<>
			<ComparePageJsonLd slug="mailchimp" withFaq={false} />
			<ComparisonPageShell
				pagePath={pagePath}
				titleLines={["Reloop vs Mailchimp"]}
				description={heroDescription}
				updatedAt="October 27, 2026"
				primaryCta={{
					label: "Get Started ",
					href: "/dashboard/signup",
				}}
				secondaryCta={
					hasGuide
						? { label: "Migrate from Mailchimp", href: "/migrate/mailchimp" }
						: undefined
				}
				openSourceNote="Mailchimp isn't open source: you can't run it on your own server."
				afterHero={
					<section className="border-stroke-soft-100 border-b dark:border-white/10">
						<CompareFeaturesHeading competitorName="Mailchimp" />
						<CompareFeatureGrid
							competitorName="Mailchimp"
							features={mailchimpFeatures}
						/>
					</section>
				}
			>
				<CompareOtherPills
					currentHref={pagePath}
					competitorName="Mailchimp"
					sourceHost="mailchimp.com"
					checkedOn={costsCheckedAt}
				/>
			</ComparisonPageShell>
		</>
	);
};

export default MailchimpComparisonPage;
