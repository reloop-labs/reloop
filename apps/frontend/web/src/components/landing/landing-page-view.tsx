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
import { ConnectApplications } from "@reloop/web/app/(home)/components/connect-applications";
import { ContactSolutions } from "@reloop/web/app/(home)/components/contact-solutions";
import CTA from "@reloop/web/app/(home)/components/cta";
import { DataVisualization } from "@reloop/web/app/(home)/components/data-visualization";
import { EnterpriseSecurity } from "@reloop/web/app/(home)/components/enterprise-security";
import { GridSeparator } from "@reloop/web/app/(home)/components/grid-separator";
import { HomeFaq } from "@reloop/web/app/(home)/components/home-faq";
import { PaymentSolutions } from "@reloop/web/app/(home)/components/payment-solutions";
import { PlatformShowcase } from "@reloop/web/app/(home)/components/platform-showcase";
import { ReloopStory } from "@reloop/web/app/(home)/components/reloop-story";
import { SecureVerification } from "@reloop/web/app/(home)/components/secure-verification";
import { TransactionalEmails } from "@reloop/web/app/(home)/components/transactional-emails";

const siteUrl = getSiteUrl();
const organizationId = `${siteUrl}/#organization`;

export const homeSchema = [
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

export function LandingPageView() {
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
