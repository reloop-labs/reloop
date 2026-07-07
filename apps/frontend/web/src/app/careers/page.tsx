import { JsonLd } from "@reloop/web/components/json-ld";
import {
	MarketingPageShell,
	PageSection,
} from "@reloop/web/components/page-shell";
import { contactEmail, getSiteUrl, socialProfiles } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import { CareersSection } from "./components/careers-section";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const pagePath = "/careers";
const pageUrl = `${getSiteUrl()}${pagePath}`;
const careersMailto = `mailto:${contactEmail}?subject=${encodeURIComponent("I'd like to build with Reloop")}`;

const pageDescription =
	"Reloop is building a team of A players who care obsessively about craft. Open-source email infrastructure—if that sounds like your kind of work, we'd like to hear from you.";

export const metadata: Metadata = {
	title: "Careers | Reloop",
	description: pageDescription,
	keywords: [
		"Reloop careers",
		"work at Reloop",
		"open source jobs",
		"email infrastructure jobs",
		"contribute to Reloop",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: "Careers | Reloop",
		description: pageDescription,
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: "Careers | Reloop",
		description: pageDescription,
	},
};

const CareersPage = () => {
	const siteUrl = getSiteUrl();
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		"@id": `${pageUrl}#webpage`,
		url: pageUrl,
		name: "Careers | Reloop",
		description: pageDescription,
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
				titleLines={["Careers at Reloop.", "Built one A player at a time."]}
				description="We're building open-source email infrastructure with people who care about craft more than credentials. If that sounds like you, read on."
				primaryCta={{
					label: "Introduce yourself",
					href: careersMailto,
				}}
				secondaryCta={{
					label: "Browse the repo",
					href: socialProfiles.github,
					external: true,
				}}
				compactHero
			>
				<PageSection narrow flushTop>
					<CareersSection />
				</PageSection>
			</MarketingPageShell>
		</>
	);
};

export default CareersPage;
