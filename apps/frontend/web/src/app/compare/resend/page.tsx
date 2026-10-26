import { FaqSection } from "@reloop/web/components/faq-section";
import { getComparePage } from "@reloop/web/lib/compare-content";
import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import { formatUsd, getCostSpotlight } from "../compare-hero-costs";
import { CompareFeatureGrid } from "../components/compare-feature-grid";
import { CompareFeaturesHeading } from "../components/compare-features-heading";
import { ComparePageJsonLd } from "../components/compare-json-ld";
import { CompareOtherLinks } from "../components/compare-other-links";
import { CompareSection } from "../components/compare-section";
import { ComparisonPageShell } from "../components/comparison-page-shell";
import { resendComparisonCategories } from "./comparison-data";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const pagePath = "/compare/resend";

/** Prices come from the same quotes as the hero card, so the copy never disagrees with it. */
const spotlight = getCostSpotlight("resend");
const heroDescription = spotlight
	? `Resend is a hosted email API on Amazon SES. Reloop is open source, and costs ${formatUsd(spotlight.reloop.usd)} a month at ${spotlight.volumeLabel.replace(" a month", "")}, Resend ${formatUsd(spotlight.competitor.usd)}.`
	: "Resend is a hosted email API on Amazon SES. Reloop is open source, with its own mail servers.";
const siteUrl = getSiteUrl();
const pageUrl = `${siteUrl}${pagePath}`;

export const metadata: Metadata = {
	title: "Open-Source Resend Alternative: Reloop vs Resend (2026)",
	description:
		"Compare Reloop vs Resend in 2026: open-source Resend alternative with self-hosting, $10/50k pricing vs $20/50k, own MTA, agent inbox, and migration guide.",
	keywords: [
		"Reloop vs Resend",
		"Resend alternative",
		"Resend alternatives 2026",
		"open source Resend alternative",
		"self-hosted Resend alternative",
		"Resend vs Reloop pricing",
		"best Resend alternative",
		"self-hosted email API",
		"KumoMTA email",
	],
	openGraph: {
		title: "Open-Source Resend Alternative: Reloop vs Resend (2026)",
		description:
			"Compare Reloop vs Resend in 2026: open-source Resend alternative with self-hosting, $10/50k pricing vs $20/50k, own MTA, agent inbox, and migration guide.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Open-Source Resend Alternative: Reloop vs Resend (2026)",
		description:
			"Compare Reloop vs Resend in 2026: open-source Resend alternative with self-hosting, $10/50k pricing vs $20/50k, own MTA, agent inbox, and migration guide.",
	},
	alternates: { canonical: pageUrl },
};

const ResendComparisonPage = () => {
	const compare = getComparePage("resend");

	return (
		<>
			<ComparePageJsonLd slug="resend" />
			<ComparisonPageShell
				pagePath={pagePath}
				titleLines={["Reloop vs Resend"]}
				description={heroDescription}
				updatedAt="October 26, 2026"
				primaryCta={{
					label: "Get Started ",
					href: "/dashboard/signup",
				}}
				secondaryCta={{
					label: "Migrate from Resend",
					href: "/compare/resend#migrate",
				}}
				afterHero={
					<section className="border-stroke-soft-100 border-b dark:border-white/10">
						<CompareFeaturesHeading competitorName="Resend" />
						<CompareFeatureGrid
							competitorName="Resend"
							categories={resendComparisonCategories}
						/>
					</section>
				}
			>
				<FaqSection
					id="compare-resend-faq"
					title="Reloop vs Resend FAQ"
					items={compare?.faqs ?? []}
					compact
					flush
				/>

				<CompareSection maxWidth="full" noDivider>
					<CompareOtherLinks currentHref={pagePath} />
				</CompareSection>
			</ComparisonPageShell>
		</>
	);
};

export default ResendComparisonPage;
