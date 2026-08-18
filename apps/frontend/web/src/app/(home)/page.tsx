import { JsonLd } from "@reloop/web/components/json-ld";
import {
	defaultOgImage,
	getSiteUrl,
	siteDescription,
	siteName,
	socialProfiles,
} from "@reloop/web/lib/site";
import LanguageExplorer from "../sdk/components/language-explorer";
import Convictions from "./components/convictions";
import CTA from "./components/cta";
import EmailSystem from "./components/email-system";
import Hero from "./components/hero";
import Highlights from "./components/highlights";
import { SectionSeparator } from "./components/section-separator";
import ShipFast from "./components/ship-fast";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const siteUrl = getSiteUrl();

const homeSchema = [
	{
		"@context": "https://schema.org" as const,
		"@type": "WebSite" as const,
		name: siteName,
		url: siteUrl,
		description: siteDescription,
	},
	{
		"@context": "https://schema.org" as const,
		"@type": "Organization" as const,
		name: "Reloop Labs",
		alternateName: siteName,
		url: siteUrl,
		logo: `${siteUrl}${defaultOgImage}`,
		sameAs: [socialProfiles.github, socialProfiles.x, socialProfiles.discord],
	},
	{
		"@context": "https://schema.org" as const,
		"@type": "SoftwareApplication" as const,
		name: siteName,
		operatingSystem: "All",
		applicationCategory: "DeveloperApplication",
		description: siteDescription,
		offers: {
			"@type": "Offer" as const,
			price: "0",
			priceCurrency: "USD",
		},
	},
];

export default function Home() {
	return (
		<div className="relative w-full">
			<JsonLd data={homeSchema} />
			<Hero />
			<div className="relative mx-auto flex w-full max-w-5xl flex-col border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
				<SectionSeparator />
				<Convictions />
				<SectionSeparator />
				<EmailSystem />
				<SectionSeparator />
				<LanguageExplorer
					framed={false}
					showTopRule={false}
					showHeading
					id="sdks"
				/>
				<SectionSeparator />
				<Highlights />
				<SectionSeparator />
				<ShipFast />
				<SectionSeparator />
				<CTA />
			</div>
		</div>
	);
}
