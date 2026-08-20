import { SectionSeparator } from "../../(home)/components/section-separator";
import { QuickStart } from "./components/quick-start";
import { SpecsBento } from "./components/specs-bento";
import { TransactionalCta } from "./components/transactional-cta";
import { TransactionalHero } from "./components/transactional-hero";
import { UseCases } from "./components/use-cases";

const TransactionEmailsPage = () => {
	return (
		<div className="relative min-h-screen overflow-x-hidden bg-bg-white-0 font-sans text-text-strong-950 selection:bg-orange-500/20 dark:bg-black dark:text-white">
			<TransactionalHero />
			<div className="relative mx-auto flex w-full max-w-5xl flex-col border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
				<SpecsBento />
				<SectionSeparator />
				<QuickStart />
				<SectionSeparator />
				<UseCases />
				<SectionSeparator />
				<TransactionalCta />
			</div>
		</div>
	);
};

export default TransactionEmailsPage;
