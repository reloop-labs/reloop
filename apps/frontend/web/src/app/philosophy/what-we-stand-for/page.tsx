import { JsonLd } from "@reloop/web/components/json-ld";
import {
	FeatureCta,
	MarketingPageShell,
	PageSection,
} from "@reloop/web/components/page-shell";
import { getSiteUrl, socialProfiles } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import { WhatWeStandForSection } from "./components/what-we-stand-for-section";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const pagePath = "/philosophy/what-we-stand-for";
const pageUrl = `${getSiteUrl()}${pagePath}`;

export const metadata: Metadata = {
	title: "What We Stand For | Our Open Source Principles | Reloop",
	description:
		"Discover the six core principles driving Reloop: open source code, developer-first tooling, and transparent email infrastructure you can self-host and trust.",
	keywords: [
		"Reloop values",
		"open source values",
		"company principles",
		"email infrastructure values",
		"developer-first company",
		"transparent software company",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: "What We Stand For | Our Open Source Principles | Reloop",
		description:
			"Discover the six core principles driving Reloop: open source code, developer-first tooling, and transparent email infrastructure you can self-host and trust.",
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "What We Stand For | Our Open Source Principles | Reloop",
		description:
			"Discover the six core principles driving Reloop: open source code, developer-first tooling, and transparent email infrastructure you can self-host and trust.",
	},
};

const WhatWeStandForPage = () => {
	const siteUrl = getSiteUrl();
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		"@id": `${siteUrl}/philosophy/what-we-stand-for#webpage`,
		url: `${siteUrl}/philosophy/what-we-stand-for`,
		name: "What We Stand For | Our Open Source Principles | Reloop",
		description:
			"Discover the six core principles driving Reloop: open source code, developer-first tooling, and transparent email infrastructure you can self-host and trust.",
		isPartOf: {
			"@type": "WebSite",
			"@id": `${siteUrl}/#website`,
			name: "Reloop",
			url: siteUrl,
		},
	};

	return (
		<>
			<JsonLd data={jsonLd} />
			<MarketingPageShell
				titleLines={["Principles we build by.", "Not taglines we hide behind."]}
				description="Reloop is built on absolute transparency. These six principles guide every feature we design, the code we open-source, and how we protect your developer independence."
				primaryCta={{
					label: "Explore why we're open source",
					href: "/philosophy/why-open-source",
				}}
				secondaryCta={{
					label: "Meet our team",
					href: "/company/about-us",
				}}
				fullViewportHero
			>
				<PageSection flushTop>
					<WhatWeStandForSection />
				</PageSection>

				<FeatureCta
					title="See the principles in code"
					titleMuted="not a slide deck."
					description="3,000 emails per month free—or clone the repo and run Reloop on infrastructure you control."
					primary={{
						label: "Start sending free",
						href: "/dashboard/signup",
					}}
					secondary={{
						label: "View on GitHub",
						href: socialProfiles.github,
						external: true,
					}}
					compact
				/>
			</MarketingPageShell>
		</>
	);
};

export default WhatWeStandForPage;
