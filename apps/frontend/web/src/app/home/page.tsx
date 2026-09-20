import { JsonLd } from "@reloop/web/components/json-ld";
import { homeFaqItems } from "@reloop/web/lib/home-faq";
import {
	faqPageJsonLd,
	pricingSoftwareApplicationJsonLd,
} from "@reloop/web/lib/schema";
import {
	defaultOgImage,
	getSiteUrl,
	siteDescription,
	siteName,
	socialProfiles,
} from "@reloop/web/lib/site";
import type { Metadata } from "next";
import { AgentCards } from "../(home)/components/agent-cards";
import CTA from "../(home)/components/cta";
import EmailSystem from "../(home)/components/email-system";
import Hero from "../(home)/components/hero";
import Highlights from "../(home)/components/highlights";
import { HomeFaq } from "../(home)/components/home-faq";
import { SectionSeparator } from "../(home)/components/section-separator";
import LanguageExplorer from "../sdk/components/language-explorer";

// Non-indexable replica of the landing page
export const metadata: Metadata = {
	title: siteName,
	description: siteDescription,
	robots: {
		index: false,
		follow: false,
		nocache: true,
		googleBot: {
			index: false,
			follow: false,
			noimageindex: true,
			"max-video-preview": -1,
			"max-image-preview": "none",
			"max-snippet": -1,
		},
	},
};

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
	pricingSoftwareApplicationJsonLd(siteUrl),
	faqPageJsonLd(homeFaqItems),
];

export default function HomePage() {
	return (
		<div className="relative w-full">
			<JsonLd data={homeSchema} />
			<Hero />
			<div className="relative mx-auto flex w-full max-w-5xl flex-col border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
				<SectionSeparator />
				<LanguageExplorer
					framed={false}
					showTopRule={false}
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
				<div aria-hidden className="h-12 sm:h-16" />
				<CTA />
				<div aria-hidden className="h-16 sm:h-24" />
				<HomeFaq />
			</div>
		</div>
	);
}
