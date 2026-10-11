import { PageSection, SectionHeading } from "@reloop/web/components/page-shell";
import { cliExamples } from "@reloop/web/lib/landing/ai-tools/cli";
import { SdkCodeBlock } from "../../../sdk/components/sdk-code-block";

export default function Examples() {
	return (
		<div id="examples" className="scroll-mt-24">
			<PageSection>
				<SectionHeading
					title="Built for scripts and agents"
					description="Predictable output, stdin everywhere and safe retries. The same commands work in a shell, a CI job or a coding agent."
				/>
				<div className="divide-y divide-stroke-soft-200 overflow-hidden rounded-4xl border border-stroke-soft-200 dark:divide-white/10 dark:border-white/10">
					{cliExamples.map((example) => (
						<div
							key={example.id}
							id={example.id}
							className="grid scroll-mt-24 gap-6 bg-bg-weak-50 p-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-10 lg:p-10 dark:bg-transparent"
						>
							<div>
								<h3 className="font-semibold text-[18px] text-text-strong-950 leading-snug sm:text-[20px] dark:text-white">
									{example.title}
								</h3>
								<p className="mt-3 text-[14px] text-text-sub-600 leading-[1.7] dark:text-white/50">
									{example.body}
								</p>
							</div>
							<div className="min-w-0">
								<SdkCodeBlock
									code={example.code}
									lang={example.lang ?? "bash"}
									path={example.path}
								/>
							</div>
						</div>
					))}
				</div>
			</PageSection>
		</div>
	);
}
