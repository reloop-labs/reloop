import { JsonLd } from "@reloop/web/components/json-ld";
import { LandingAgentCards } from "@reloop/web/components/landing/landing-agent-cards";
import { LandingDeveloperProof } from "@reloop/web/components/landing/landing-developer-proof";
import { LandingHero } from "@reloop/web/components/landing/landing-hero";
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
import { ConnectApplications } from "../(home)/components/connect-applications";
import { ContactSolutions } from "../(home)/components/contact-solutions";
import CTA from "../(home)/components/cta";
import { DataVisualization } from "../(home)/components/data-visualization";
import { EnterpriseSecurity } from "../(home)/components/enterprise-security";
import { GridSeparator } from "../(home)/components/grid-separator";
import Highlights from "../(home)/components/highlights";
import { HomeFaq } from "../(home)/components/home-faq";
import { PaymentSolutions } from "../(home)/components/payment-solutions";
import { PlatformShowcase } from "../(home)/components/platform-showcase";
import { ReloopStory } from "../(home)/components/reloop-story";
import { SecureVerification } from "../(home)/components/secure-verification";
import { TransactionalEmails } from "../(home)/components/transactional-emails";

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
			<LandingHero />
			<LandingAgentCards />
			<LandingDeveloperProof />
			<ReloopStory />
			<TransactionalEmails />
			<GridSeparator />
			<SecureVerification />
			<GridSeparator />
			<PaymentSolutions />
			<GridSeparator />
			<ContactSolutions />
			<GridSeparator />
			<PlatformShowcase />
			<GridSeparator />
			<ConnectApplications />
			<DataVisualization />
			<EnterpriseSecurity />
			<div className="relative mx-auto flex w-full max-w-[1280px] flex-col border-[#ebebeb] border-x dark:border-[#292929]">
				<Highlights />
				<div aria-hidden className="h-12 sm:h-16" />
				<CTA />
				<div aria-hidden className="h-16 sm:h-24" />
				<HomeFaq />
			</div>
		</div>
	);
}
