import { JsonLd } from "@reloop/web/components/json-ld";
import { LandingDeveloperProof } from "@reloop/web/components/landing/landing-developer-proof";
import { breadcrumbJsonLd, faqPageJsonLd } from "@reloop/web/lib/schema";
import { SectionSeparator } from "../../(home)/components/section-separator";
import { ConnectServicesSection } from "./components/connect-services-section";
import { IntegrateSection } from "./components/integrate-section";
import { ObservabilitySection } from "./components/observability-section";
import { TransactionalCta } from "./components/transactional-cta";
import {
	TransactionalFaq,
	transactionalFaq,
} from "./components/transactional-faq";
import { TransactionalHero } from "./components/transactional-hero";
import { UseCasesSection } from "./components/use-cases-section";

const TransactionEmailsPage = () => {
	return (
		<div className="relative min-h-screen overflow-x-hidden bg-bg-white-0 font-sans text-text-strong-950 selection:bg-neutral-200 dark:bg-black dark:text-white dark:selection:bg-neutral-800">
			<JsonLd
				data={[
					breadcrumbJsonLd([
						{ name: "Features", path: "/features" },
						{
							name: "Transactional email",
							path: "/features/transaction-emails",
						},
					]),
					faqPageJsonLd(transactionalFaq),
				]}
			/>
			<TransactionalHero />
			<div className="relative mx-auto w-full max-w-5xl border-stroke-soft-100 border-x md:max-w-7xl dark:border-white/10">
				<div
					aria-hidden
					className="h-24 border-stroke-soft-100 border-t sm:h-24 dark:border-white/10"
				/>
			</div>
			<LandingDeveloperProof />
			<div className="relative mx-auto w-full max-w-5xl border-stroke-soft-100 border-x md:max-w-7xl dark:border-white/10">
				<SectionSeparator hideTop className="h-24 sm:h-24" />
				<IntegrateSection />
				<SectionSeparator className="h-24 sm:h-24" />
				<ConnectServicesSection />
				<SectionSeparator className="h-24 sm:h-24" />
				<ObservabilitySection />
				<SectionSeparator className="h-24 sm:h-24" />
				<UseCasesSection />
				<SectionSeparator className="h-24 sm:h-24" />
				<TransactionalFaq />
				<SectionSeparator className="h-24 sm:h-24" />
				<TransactionalCta />
			</div>
		</div>
	);
};

export default TransactionEmailsPage;
