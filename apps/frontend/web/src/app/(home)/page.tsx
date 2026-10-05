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
import { ConnectApplications } from "./components/connect-applications";
import { ContactSolutions } from "./components/contact-solutions";
import CTA from "./components/cta";
import { DataVisualization } from "./components/data-visualization";
import { EnterpriseSecurity } from "./components/enterprise-security";
import { GridSeparator } from "./components/grid-separator";
import { HomeFaq } from "./components/home-faq";
import { PaymentSolutions } from "./components/payment-solutions";
import { PlatformShowcase } from "./components/platform-showcase";
import { ReloopStory } from "./components/reloop-story";
import { SecureVerification } from "./components/secure-verification";
import { TransactionalEmails } from "./components/transactional-emails";

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
	faqPageJsonLd(homeFaqItems),
];

export default function Home() {
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
			<div className="relative mx-auto flex w-full max-w-5xl flex-col border-stroke-soft-100 border-x border-t md:max-w-7xl dark:border-white/10">
				<CTA />
				<div aria-hidden className="h-16 sm:h-24" />
				<HomeFaq />
			</div>
		</div>
	);
}
