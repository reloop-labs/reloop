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
import { JsonLd } from "@reloop/web/components/json-ld";
import { LandingAgentCards } from "@reloop/web/components/landing/landing-agent-cards";
import { LandingDeveloperProof } from "@reloop/web/components/landing/landing-developer-proof";
import { LandingHero } from "@reloop/web/components/landing/landing-hero";
import { homeSchema } from "@reloop/web/lib/home-schema";

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
