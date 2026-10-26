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
import { mailgunComparisonCategories } from "./comparison-data";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const pagePath = "/compare/mailgun";

/** Prices come from the same quotes as the hero card, so the copy never disagrees with it. */
const spotlight = getCostSpotlight("mailgun");
const heroDescription = spotlight
	? `Mailgun is a hosted email API that bills extra per 1,000 emails past your plan. Reloop is open source, and costs ${formatUsd(spotlight.reloop.usd)} a month at ${spotlight.volumeLabel.replace(" a month", "")}, Mailgun ${formatUsd(spotlight.competitor.usd)}.`
	: "Mailgun is a hosted email API. Reloop is open source, with its own mail servers.";
const siteUrl = getSiteUrl();
const pageUrl = `${siteUrl}${pagePath}`;

export const metadata: Metadata = {
	title: "Reloop vs Mailgun: Self-Hostable Email API & Inbox (2026)",
	description:
		"Compare Reloop vs Mailgun in 2026: open-source Mailgun alternative with self-hosting, $10/50k vs $35/50k, agent inbox, and 3-field SMTP cutover.",
	keywords: [
		"Reloop vs Mailgun",
		"Mailgun alternative",
		"Mailgun alternatives 2026",
		"open source Mailgun alternative",
		"self-hosted Mailgun alternative",
		"Mailgun vs Reloop pricing",
		"best Mailgun alternative",
		"SMTP comparison",
		"email API comparison",
	],
	openGraph: {
		title: "Reloop vs Mailgun: Self-Hostable Email API & Inbox (2026)",
		description:
			"Compare Reloop vs Mailgun in 2026: open-source Mailgun alternative with self-hosting, $10/50k vs $35/50k, agent inbox, and 3-field SMTP cutover.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Reloop vs Mailgun: Self-Hostable Email API & Inbox (2026)",
		description:
			"Compare Reloop vs Mailgun in 2026: open-source Mailgun alternative with self-hosting, $10/50k vs $35/50k, agent inbox, and 3-field SMTP cutover.",
	},
	alternates: { canonical: pageUrl },
};

const MailgunComparisonPage = () => {
	return (
		<>
			<ComparePageJsonLd slug="mailgun" withFaq={false} />
			<ComparisonPageShell
				pagePath={pagePath}
				titleLines={["Reloop vs Mailgun"]}
				description={heroDescription}
				updatedAt="September 17, 2026"
				primaryCta={{
					label: "Get Started ",
					href: "/dashboard/signup",
				}}
				secondaryCta={{
					label: "Migrate from Mailgun",
					href: "/migrate/mailgun",
				}}
				openSourceNote="Mailgun isn't open source: you can't run it on your own server."
				afterHero={
					<section className="border-stroke-soft-100 border-b dark:border-white/10">
						<CompareFeaturesHeading competitorName="Mailgun" />
						<CompareFeatureGrid
							competitorName="Mailgun"
							categories={mailgunComparisonCategories}
						/>
					</section>
				}
			>
				<CompareOtherPills
					currentHref={pagePath}
					competitorName="Mailgun"
					sourceHost="mailgun.com"
					checkedOn={costsCheckedAt}
				/>
			</ComparisonPageShell>
		</>
	);
};

export default MailgunComparisonPage;
