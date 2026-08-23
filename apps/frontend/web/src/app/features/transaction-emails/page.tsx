import { SectionSeparator } from "../../(home)/components/section-separator";
import { FrameworksStack } from "./components/frameworks-stack";
import { TransactionalCta } from "./components/transactional-cta";
import { TransactionalHero } from "./components/transactional-hero";
import { TransactionalPreviewSection } from "./components/transactional-preview-section";
import { UseCases } from "./components/use-cases";

const TransactionEmailsPage = () => {
	return (
		<div className="relative min-h-screen overflow-x-hidden bg-bg-white-0 font-sans text-text-strong-950 selection:bg-neutral-200 dark:selection:bg-neutral-800 dark:bg-black dark:text-white">
			<TransactionalHero />
			<TransactionalPreviewSection />
			<div className="relative mx-auto flex w-full max-w-5xl flex-col border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
				<SectionSeparator />
				<FrameworksStack />
				<SectionSeparator />
				<UseCases />
				<SectionSeparator />
				<TransactionalCta />
			</div>
		</div>
	);
};

export default TransactionEmailsPage;
