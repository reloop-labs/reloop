import { SdkCodeBlock } from "../../../sdk/components/sdk-code-block";

/** Numbered three-up step cards, same chrome as the AI agents setup guide. */

const stepCardClassName =
	"flex flex-col justify-between border-stroke-soft-200 border-t border-l-0 bg-bg-weak-50 p-8 transition-colors duration-300 first:border-t-0 md:border-t md:border-l md:p-10 dark:border-white/10 dark:bg-transparent dark:hover:bg-white/[0.02] md:[&:nth-child(-n+3)]:border-t-0 md:[&:nth-child(3n+1)]:border-l-0";

export type StepCard = {
	title: string;
	body: string;
	code?: string;
	lang?: string;
};

export function StepCards({
	id,
	title,
	description,
	steps,
}: {
	id: string;
	title: string;
	description: string;
	steps: StepCard[];
}) {
	return (
		<section
			id={id}
			className="scroll-mt-24 bg-[#f8f8f8] text-text-strong-950 dark:bg-black dark:text-white"
		>
			<div className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
				<div className="text-center">
					<h2 className="font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem] dark:text-white">
						{title}
					</h2>
					<p className="mx-auto mt-4 max-w-xl text-base text-text-sub-600 dark:text-white/50">
						{description}
					</p>
				</div>

				<div className="mt-20 grid overflow-hidden rounded-4xl border border-stroke-soft-200 md:grid-cols-3 dark:border-white/10">
					{steps.map((step, index) => (
						<div key={step.title} className={stepCardClassName}>
							<div className="min-w-0">
								<div className="flex size-8 items-center justify-center rounded-lg bg-[#0a0d12] font-bold font-mono text-white text-xs dark:bg-white dark:text-black">
									{index + 1}
								</div>
								<h3 className="mt-4 font-semibold text-lg text-text-strong-950 leading-snug dark:text-white">
									{step.title}
								</h3>
								<p className="mt-4 text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/50">
									{step.body}
								</p>
							</div>
							{step.code && (
								<div className="mt-6 min-w-0">
									<SdkCodeBlock code={step.code} lang={step.lang ?? "bash"} />
								</div>
							)}
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
