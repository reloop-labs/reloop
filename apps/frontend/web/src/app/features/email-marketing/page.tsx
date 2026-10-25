import { LandingDeveloperProof } from "@reloop/web/components/landing/landing-developer-proof";
import { SectionSeparator } from "../../(home)/components/section-separator";
import { AiNativeSection } from "./components/ai-native-section";
import { FrameworksStack } from "./components/frameworks-stack";
import { MarketingCta } from "./components/marketing-cta";
import { MarketingHero } from "./components/marketing-hero";
import { MarketingProof } from "./components/marketing-proof";
import { UseCases } from "./components/use-cases";

const EmailMarketingPage = () => {
	return (
		<div className="relative min-h-screen overflow-x-hidden bg-bg-white-0 font-sans text-text-strong-950 selection:bg-neutral-200 dark:bg-black dark:text-white dark:selection:bg-neutral-800">
			<MarketingHero />
			<div className="relative mx-auto w-full max-w-5xl border-stroke-soft-100 border-x md:max-w-7xl dark:border-white/10">
				<div
					aria-hidden
					className="h-24 border-stroke-soft-100 border-t dark:border-white/10"
				/>
			</div>
			<LandingDeveloperProof />
			<div className="relative mx-auto flex w-full max-w-5xl flex-col border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
				<MarketingProof />
				<SectionSeparator />
				<AiNativeSection />
				<SectionSeparator />
				<FrameworksStack />
				<SectionSeparator />
				<UseCases />
				<SectionSeparator />
				<MarketingCta />
			</div>
		</div>
	);
};

export default EmailMarketingPage;
