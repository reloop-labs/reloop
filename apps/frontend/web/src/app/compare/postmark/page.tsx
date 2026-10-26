import { postmarkFeatures } from "@reloop/web/lib/compare-content";
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

const pagePath = "/compare/postmark";

/** Prices come from the same quotes as the hero card, so the copy never disagrees with it. */
const spotlight = getCostSpotlight("postmark");
const heroDescription = spotlight
	? `Postmark is a hosted email API for transactional email. Reloop is open source, and costs ${formatUsd(spotlight.reloop.usd)} a month at ${spotlight.volumeLabel.replace(" a month", "")}, Postmark ${formatUsd(spotlight.competitor.usd)}.`
	: "Postmark is a hosted email API for transactional email. Reloop is open source, with its own mail servers.";
const pageUrl = `${getSiteUrl()}${pagePath}`;

export const metadata: Metadata = {
	title: "Reloop vs Postmark | Email Provider Comparison",
	description:
		"Learn how Reloop compares to Postmark and why Reloop is the best Postmark alternative for all your transactional email needs.",
	keywords: [
		"Reloop vs Postmark",
		"Postmark alternative",
		"transactional email comparison",
		"email deliverability comparison",
		"open source Postmark alternative",
	],
	openGraph: {
		title: "Reloop vs Postmark",
		description:
			"Learn how Reloop compares to Postmark and why Reloop is the best Postmark alternative for all your transactional email needs.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Reloop vs Postmark | Email Provider Comparison",
		description:
			"Learn how Reloop compares to Postmark and why Reloop is the best Postmark alternative for all your transactional email needs.",
	},
	alternates: { canonical: pageUrl },
};

const PostmarkComparisonPage = () => {
	const hasGuide = Boolean(getMigrationGuide("postmark"));
	return (
		<>
			<ComparePageJsonLd slug="postmark" withFaq={false} />
			<ComparisonPageShell
				pagePath={pagePath}
				titleLines={["Reloop vs Postmark"]}
				description={heroDescription}
				updatedAt="October 27, 2026"
				primaryCta={{
					label: "Get Started ",
					href: "/dashboard/signup",
				}}
				secondaryCta={
					hasGuide
						? { label: "Migrate from Postmark", href: "/migrate/postmark" }
						: undefined
				}
				openSourceNote="Postmark isn't open source: you can't run it on your own server."
				afterHero={
					<section className="border-stroke-soft-100 border-b dark:border-white/10">
						<CompareFeaturesHeading competitorName="Postmark" />
						<CompareFeatureGrid
							competitorName="Postmark"
							features={postmarkFeatures}
						/>
					</section>
				}
			>
				<CompareOtherPills
					currentHref={pagePath}
					competitorName="Postmark"
					sourceHost="postmarkapp.com"
					checkedOn={costsCheckedAt}
				/>
			</ComparisonPageShell>
		</>
	);
};

export default PostmarkComparisonPage;
