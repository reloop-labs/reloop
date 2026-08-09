import { JsonLd } from "@reloop/web/components/json-ld";
import {
	MarketingPageShell,
	PageSection,
} from "@reloop/web/components/page-shell";
import { contactEmail, getSiteUrl, socialProfiles } from "@reloop/web/lib/site";
import type { Metadata } from "next";
import { CareersContact, CareersCulture } from "./components/careers-section";
import { CareersValues } from "./components/careers-values";
import { KeepUpToDate } from "./components/keep-up-to-date";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const pagePath = "/careers";
const pageUrl = `${getSiteUrl()}${pagePath}`;
const pageTitle = "Careers at Reloop | Open Source Email Infrastructure";
const careersMailto = `mailto:${contactEmail}?subject=${encodeURIComponent("I'd like to build with Reloop")}`;

const pageDescription =
	"Join the team behind Reloop's open-source email infrastructure. We're selective, craft-obsessed, and always open to people who want to build something worth shipping.";

export const metadata: Metadata = {
	title: pageTitle,
	description: pageDescription,
	keywords: [
		"Reloop careers",
		"work at Reloop",
		"open source careers",
		"open source jobs",
		"email infrastructure jobs",
		"developer jobs email",
		"contribute to Reloop",
		"self-hostable email jobs",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: pageTitle,
		description: pageDescription,
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: pageTitle,
		description: pageDescription,
	},
};

const CareersPage = () => {
	const siteUrl = getSiteUrl();
	const jsonLd = {
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": "WebPage",
				"@id": `${pageUrl}#webpage`,
				url: pageUrl,
				name: pageTitle,
				description: pageDescription,
				inLanguage: "en",
				isPartOf: {
					"@type": "WebSite",
					"@id": `${siteUrl}/#website`,
					name: "Reloop",
					url: siteUrl,
				},
				about: {
					"@id": `${siteUrl}/#organization`,
				},
			},
			{
				"@type": "Organization",
				"@id": `${siteUrl}/#organization`,
				name: "Reloop Labs",
				url: siteUrl,
				email: contactEmail,
				sameAs: [
					socialProfiles.github,
					socialProfiles.discord,
					socialProfiles.x,
				],
				contactPoint: {
					"@type": "ContactPoint",
					contactType: "hiring",
					email: contactEmail,
					url: pageUrl,
				},
			},
		],
	};

	return (
		<>
			<JsonLd data={jsonLd} />
			{/* Top Hero & Culture Section */}
			<div className="mx-auto flex w-full max-w-5xl flex-col border-stroke-soft-200 border-x pt-6 pb-16 md:max-w-7xl dark:border-white/10">
				<MarketingPageShell
					titleLines={["Careers at Reloop."]}
					compactHero
					tightHeroBottom
				>
					<PageSection narrow flushTop>
						<CareersCulture />
					</PageSection>
				</MarketingPageShell>
			</div>

			{/* Our Values Section */}
			<CareersValues />

			{/* Get in Touch Section */}
			<CareersContact />

			{/* Keep Up To Date Section */}
			<KeepUpToDate />
		</>
	);
};

export default CareersPage;
