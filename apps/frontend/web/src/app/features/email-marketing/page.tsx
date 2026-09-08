import { SectionSeparator } from "../../(home)/components/section-separator";
import { AiNativeSection } from "./components/ai-native-section";
import { FrameworksStack } from "./components/frameworks-stack";
import { MarketingCta } from "./components/marketing-cta";
import { MarketingHero } from "./components/marketing-hero";
import { MarketingPreviewSection } from "./components/marketing-preview-section";
import { UseCases } from "./components/use-cases";

const EmailMarketingPage = () => {
	return (
		<div className="relative min-h-screen overflow-x-hidden bg-bg-white-0 font-sans text-text-strong-950 selection:bg-orange-200/20 dark:bg-black dark:text-white dark:selection:bg-orange-500/40">
			<MarketingHero />
			<MarketingPreviewSection />
			<div className="relative mx-auto flex w-full max-w-5xl flex-col border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
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
