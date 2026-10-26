import { sendgridFeatures } from "@reloop/web/lib/compare-content";
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

const pagePath = "/compare/sendgrid";

/** Prices come from the same quotes as the hero card, so the copy never disagrees with it. */
const spotlight = getCostSpotlight("sendgrid");
const heroDescription = spotlight
	? `SendGrid is Twilio's hosted email API. Reloop is open source, and costs ${formatUsd(spotlight.reloop.usd)} a month at ${spotlight.volumeLabel.replace(" a month", "")}, SendGrid ${formatUsd(spotlight.competitor.usd)}.`
	: "SendGrid is Twilio's hosted email API. Reloop is open source, with its own mail servers.";
const pageUrl = `${getSiteUrl()}${pagePath}`;

export const metadata: Metadata = {
	title: "Reloop vs SendGrid: API-First Email Without Annual Lock-In (2026)",
	description:
		"Compare Reloop vs SendGrid in 2026: open-source SendGrid alternative with self-hosting, $10/50k vs $19.95/50k, no annual commit, plus migration checklist.",
	keywords: [
		"Reloop vs SendGrid",
		"SendGrid alternative",
		"SendGrid alternatives 2026",
		"Twilio SendGrid alternative",
		"open source SendGrid alternative",
		"self-hosted SendGrid alternative",
		"SendGrid vs Reloop pricing",
		"best SendGrid alternative",
	],
	openGraph: {
		title: "Reloop vs SendGrid: API-First Email Without Annual Lock-In (2026)",
		description:
			"Compare Reloop vs SendGrid in 2026: open-source SendGrid alternative with self-hosting, $10/50k vs $19.95/50k, no annual commit, plus migration checklist.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Reloop vs SendGrid: API-First Email Without Annual Lock-In (2026)",
		description:
			"Compare Reloop vs SendGrid in 2026: open-source SendGrid alternative with self-hosting, $10/50k vs $19.95/50k, no annual commit, plus migration checklist.",
	},
	alternates: { canonical: pageUrl },
};

const SendGridComparisonPage = () => {
	const hasGuide = Boolean(getMigrationGuide("sendgrid"));
	return (
		<>
			<ComparePageJsonLd slug="sendgrid" withFaq={false} />
			<ComparisonPageShell
				pagePath={pagePath}
				titleLines={["Reloop vs SendGrid"]}
				description={heroDescription}
				updatedAt="September 17, 2026"
				primaryCta={{
					label: "Get Started ",
					href: "/dashboard/signup",
				}}
				secondaryCta={
					hasGuide
						? { label: "Migrate from SendGrid", href: "/migrate/sendgrid" }
						: undefined
				}
				openSourceNote="SendGrid isn't open source: you can't run it on your own server."
				afterHero={
					<section className="border-stroke-soft-100 border-b dark:border-white/10">
						<CompareFeaturesHeading competitorName="SendGrid" />
						<CompareFeatureGrid
							competitorName="SendGrid"
							features={sendgridFeatures}
						/>
					</section>
				}
			>
				<CompareOtherPills
					currentHref={pagePath}
					competitorName="SendGrid"
					sourceHost="sendgrid.com"
					checkedOn={costsCheckedAt}
				/>
			</ComparisonPageShell>
		</>
	);
};

export default SendGridComparisonPage;
