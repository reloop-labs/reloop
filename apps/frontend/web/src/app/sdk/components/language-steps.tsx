import type { ReactNode } from "react";
import type { LanguageDefinition } from "../languages";
import { ExtraLinks } from "./extra-links";
import { NodeInstallBlock } from "./node-install-block";
import { ResourceLinks } from "./resource-links";
import { SdkCodeBlock } from "./sdk-code-block";

function StepItem({
	number,
	title,
	isLast = false,
	children,
}: {
	number: number;
	title: string;
	isLast?: boolean;
	children: ReactNode;
}) {
	return (
		<div className="flex gap-3.5">
			<div className="flex flex-col items-center">
				<div className="flex size-6 shrink-0 items-center justify-center rounded-full border border-stroke-soft-200 bg-bg-weak-50 font-mono font-semibold text-[11px] text-text-sub-600 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/75">
					{number}
				</div>
				{!isLast && (
					<div className="my-1.5 w-px flex-1 bg-stroke-soft-200 dark:bg-white/10" />
				)}
			</div>

			<div
				className={`flex min-w-0 flex-1 flex-col gap-2.5 ${isLast ? "" : "pb-8"}`}
			>
				<h3 className="mt-0.5 font-medium text-[13.5px] text-text-strong-950 dark:text-white">
					{title}
				</h3>
				<div className="w-full min-w-0">{children}</div>
			</div>
		</div>
	);
}

export default function LanguageSteps({
	language,
}: {
	language: LanguageDefinition;
}) {
	return (
		<section
			id="steps"
			className="relative w-full scroll-mt-20 border-stroke-soft-200 border-t bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white"
		>
			<div className="mx-auto w-full max-w-5xl border-stroke-soft-200 xl:border-x md:max-w-7xl dark:border-white/10">
				<div className="flex flex-col px-6 py-10 sm:px-8 sm:py-12 lg:px-12">
					<StepItem
						number={1}
						title={`Install the ${language.name} package`}
					>
						{language.slug === "nodejs" ? (
							<NodeInstallBlock />
						) : (
							<SdkCodeBlock code={language.installCommand} lang="bash" />
						)}
					</StepItem>

					<StepItem number={2} title={`Send email from ${language.name}`}>
						<SdkCodeBlock code={language.sendCode} slug={language.slug} />
					</StepItem>

					<StepItem number={3} title="GitHub, examples, and API reference">
						<ResourceLinks
							languageSlug={language.slug}
							languageName={language.name}
							name={language.name}
							docsPath={language.docsPath}
							variant="cards"
						/>
					</StepItem>

					<StepItem number={4} title="Need more help?" isLast>
						<ExtraLinks />
					</StepItem>
				</div>
			</div>
		</section>
	);
}
