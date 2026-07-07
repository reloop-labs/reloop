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
const careersMailto = `mailto:${contactEmail}?subject=${encodeURIComponent("Interested in contributing to Reloop")}`;

const pageDescription =
	"No open roles at Reloop right now. We're building a team of A players who care obsessively about craft. Love the product? Email us.";

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
				titleLines={["Careers at Reloop.", "Built slowly, on purpose."]}
				description="We're not rushing to hire. We're looking for people who care about craft—and want to build email infrastructure that holds up."
				primaryCta={{
					label: "Email us",
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
