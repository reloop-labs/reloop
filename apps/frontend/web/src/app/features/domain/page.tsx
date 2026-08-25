import { SectionSeparator } from "../../(home)/components/section-separator";
import { AiNativeSection } from "./components/ai-native-section";
import { DnsProvidersStack } from "./components/dns-providers-stack";
import { DomainCta } from "./components/domain-cta";
import { DomainHero } from "./components/domain-hero";
import { DomainPreviewSection } from "./components/domain-preview-section";
import { DomainUseCases } from "./components/domain-use-cases";

const DomainFeaturePage = () => {
	return (
		<div className="relative min-h-screen overflow-x-hidden bg-bg-white-0 font-sans text-text-strong-950 selection:bg-neutral-200 dark:bg-black dark:text-white dark:selection:bg-neutral-800">
			<DomainHero />
			<DomainPreviewSection />
			<div className="relative mx-auto flex w-full max-w-5xl flex-col border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
				<SectionSeparator />
				<AiNativeSection />
				<SectionSeparator />
				<DnsProvidersStack />
				<SectionSeparator />
				<DomainUseCases />
				<SectionSeparator />
				<DomainCta />
			</div>
		</div>
	);
};

export default DomainFeaturePage;
