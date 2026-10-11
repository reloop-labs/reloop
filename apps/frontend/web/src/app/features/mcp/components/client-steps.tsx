import {
	type McpClientDefinition,
	mcpPrompts,
} from "@reloop/web/lib/landing/ai-tools/mcp";
import { ExtraLinks } from "../../../sdk/components/extra-links";
import { StepItem } from "../../../sdk/components/framework-steps";
import { SdkCodeBlock } from "../../../sdk/components/sdk-code-block";
import { PromptGrid } from "./prompt-grid";

export default function McpClientSteps({
	client,
}: {
	client: McpClientDefinition;
}) {
	return (
		<section
			id="steps"
			className="relative w-full scroll-mt-20 border-stroke-soft-200 border-t bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white"
		>
			<div className="mx-auto w-full max-w-5xl border-stroke-soft-100 md:max-w-7xl xl:border-x dark:border-white/10">
				<div className="flex flex-col px-6 py-10 sm:px-8 sm:py-12 lg:px-12">
					{client.steps.map((step, index) => (
						<StepItem key={step.title} number={index + 1} title={step.title}>
							<div className="flex flex-col gap-3">
								<p className="max-w-2xl text-[14px] text-text-sub-600 leading-relaxed dark:text-white/55">
									{step.body}
								</p>
								{step.code && (
									<SdkCodeBlock
										code={step.code.value}
										lang={step.code.lang}
										path={
											step.code.lang === "bash" ? undefined : step.code.label
										}
									/>
								)}
							</div>
						</StepItem>
					))}

					<StepItem
						number={client.steps.length + 1}
						title={`Ask ${client.name} to do something`}
					>
						<div className="flex flex-col gap-3">
							<p className="max-w-2xl text-[14px] text-text-sub-600 leading-relaxed dark:text-white/55">
								Reloop can do everything you can do in the dashboard. Copy a
								prompt to try it.
							</p>
							<PromptGrid prompts={mcpPrompts.slice(0, 6)} columns={2} />
						</div>
					</StepItem>

					<StepItem
						number={client.steps.length + 2}
						title="Need more help?"
						isLast
					>
						<ExtraLinks />
					</StepItem>
				</div>
			</div>
		</section>
	);
}
