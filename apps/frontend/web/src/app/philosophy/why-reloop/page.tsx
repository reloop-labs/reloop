import { JsonLd } from "@reloop/web/components/json-ld";
import {
	FeatureCta,
	MarketingPageShell,
	PageSection,
} from "@reloop/web/components/page-shell";
import { getSiteUrl } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import { WhyReloopSection } from "./components/why-reloop-section";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const pageUrl = `${getSiteUrl()}/philosophy/why-reloop`;

export const metadata: Metadata = {
	title: "Why Reloop | The Open Source Alternative to SendGrid",
	description:
		"Compare Reloop to proprietary email platforms. Get transactional sends, SMTP relay, and analytics without vendor lock-in. Host on your servers or ours free.",
	keywords: [
		"why Reloop",
		"open source email",
		"self-hosted email",
		"email vendor lock-in",
		"email infrastructure alternative",
		"transparent email platform",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: "Why Reloop | The Open Source Alternative to SendGrid",
		description:
			"Compare Reloop to proprietary email platforms. Get transactional sends, SMTP relay, and analytics without vendor lock-in. Host on your servers or ours free.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Why Reloop | The Open Source Alternative to SendGrid",
		description:
			"Compare Reloop to proprietary email platforms. Get transactional sends, SMTP relay, and analytics without vendor lock-in. Host on your servers or ours free.",
	},
};

const WhyReloopPage = () => {
	const siteUrl = getSiteUrl();
	const jsonLd = {
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": "WebPage",
				"@id": `${siteUrl}/philosophy/why-reloop#webpage`,
				url: `${siteUrl}/philosophy/why-reloop`,
				name: "Why Reloop | The Open Source Alternative to SendGrid",
				description:
					"Compare Reloop to proprietary email platforms. Get transactional sends, SMTP relay, and analytics without vendor lock-in. Host on your servers or ours free.",
				isPartOf: {
					"@type": "WebSite",
					"@id": `${siteUrl}/#website`,
					name: "Reloop",
					url: siteUrl,
				},
			},
			{
				"@type": "Product",
				"@id": `${siteUrl}/#product`,
				name: "Reloop",
				image: `${siteUrl}/web-app-manifest-512x512.png`,
				description:
					"Open-source, self-hostable email infrastructure featuring transactional sends, campaigns, SMTP relay, and analytics.",
				brand: {
					"@type": "Brand",
					name: "Reloop Labs",
				},
				offers: {
					"@type": "Offer",
					price: "0.00",
					priceCurrency: "USD",
					availability: "https://schema.org/InStock",
					url: `${siteUrl}/pricing`,
				},
			},
		],
	};

	return (
		<>
			<JsonLd data={jsonLd} />
			<MarketingPageShell
				titleLines={["Proprietary-grade email.", "Without the lock-in."]}
				description="Get transactional sending, marketing campaigns, SMTP relay, and deep analytics without the black box. Run Reloop on our secure cloud or deploy it on your own servers."
				primaryCta={{
					label: "Start sending free",
					href: "/dashboard/signup",
				}}
				secondaryCta={{
					label: "Deploy on your servers",
					href: "/docs/self-host",
				}}
				fullViewportHero
			>
				<PageSection flushTop>
					<WhyReloopSection />
				</PageSection>

				<FeatureCta
					title="Try it free"
					titleMuted="or run it yourself."
					description="3,000 emails per month on the Free plan—no credit card. Or clone the repo and deploy Reloop on infrastructure you control."
					primary={{
						label: "Start sending free",
						href: "/dashboard/signup",
					}}
					secondary={{
						label: "Deploy on your servers",
						href: "/docs/self-host",
					}}
					compact
				/>
			</MarketingPageShell>
		</>
	);
};

export default WhyReloopPage;
