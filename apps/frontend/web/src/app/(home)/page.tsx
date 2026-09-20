import { JsonLd } from "@reloop/web/components/json-ld";
import { pricingSoftwareApplicationJsonLd } from "@reloop/web/lib/schema";
import {
	defaultOgImage,
	getSiteUrl,
	siteDescription,
	siteName,
	socialProfiles,
} from "@reloop/web/lib/site";
import type { Metadata } from "next";
import LanguageExplorer from "../sdk/components/language-explorer";
import { AgentCards } from "./components/agent-cards";
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
const organizationId = `${siteUrl}/#organization`;

export const metadata: Metadata = {
	title: {
		absolute: "Reloop: Open-Source Email API & Infrastructure for Developers",
	},
	description: siteDescription,
	alternates: { canonical: siteUrl },
	openGraph: {
		title: "Reloop: Open-Source Email API & Infrastructure for Developers",
		description: siteDescription,
		url: siteUrl,
		type: "website",
		siteName,
	},
};

const homeSchema = [
	{
		"@context": "https://schema.org" as const,
		"@type": "WebSite" as const,
		"@id": `${siteUrl}/#website`,
		name: siteName,
		url: siteUrl,
		description: siteDescription,
		publisher: { "@id": organizationId },
	},
	{
		"@context": "https://schema.org" as const,
		"@type": "Organization" as const,
		"@id": organizationId,
		name: "Reloop Labs",
		alternateName: siteName,
		url: siteUrl,
		logo: `${siteUrl}${defaultOgImage}`,
		sameAs: [
			socialProfiles.github,
			socialProfiles.x,
			socialProfiles.discord,
			socialProfiles.linkedin,
		],
	},
	{
		...pricingSoftwareApplicationJsonLd(siteUrl),
		"@id": `${siteUrl}/#software`,
		url: siteUrl,
		publisher: { "@id": organizationId },
	},
];

export default function Home() {
	return (
		<div className="relative w-full">
			<JsonLd data={homeSchema} />
			<Hero />
			<div className="relative mx-auto flex w-full max-w-5xl flex-col border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
				<LanguageExplorer
					framed={false}
					showTopRule
					showHeading
					showHelp={false}
					id="sdks"
				/>
				<SectionSeparator />
				<AgentCards />
				<SectionSeparator />
				<EmailSystem />
				<SectionSeparator />
				<Highlights />
				<SectionSeparator />
				<ShipFast />
				<div aria-hidden className="h-12 sm:h-16" />
				<CTA />
			</div>
		</div>
	);
}
