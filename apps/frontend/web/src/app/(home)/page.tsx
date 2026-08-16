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
import Hero from "./components/hero";
import Highlights from "./components/highlights";
import Integrate from "./components/integrate";
import { SectionSeparator } from "./components/section-separator";
import ShipFast from "./components/ship-fast";
import UseCase from "./components/use-case";

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
		<div className="relative mx-auto flex w-full max-w-5xl flex-col border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
			<JsonLd data={homeSchema} />
			<Hero />
			<SectionSeparator />
			<Convictions />
			<SectionSeparator />
			<UseCase />
			<SectionSeparator />
			<LanguageExplorer framed={false} showTopRule={false} id="sdks" />
			<SectionSeparator />
			<Integrate />
			<SectionSeparator />
			<Highlights />
			<SectionSeparator />
			<ShipFast />
			<SectionSeparator />
			<CTA />
		</div>
	);
}
