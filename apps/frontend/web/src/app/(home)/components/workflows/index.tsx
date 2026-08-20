import { SceneHeader } from "../_shared/scene-header";

export function WorkflowsSection() {
	return (
		<article
			id="email-system-workflows"
			data-scene="workflows"
			className="scroll-mt-28 px-4 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-16"
		>
			<SceneHeader
				icon="workflow"
				color="emerald"
				badge="AI Workflow"
				title="Automate every lifecycle event."
				description="Trigger sequences, add smart delays, handle webhooks, and branch on customer actions automatically."
				ctaLabel="Explore AI Workflow"
				ctaHref="/docs/workflows"
			/>

			<div className="relative mt-10 min-h-[20rem] overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6 sm:min-h-[24rem] dark:border-white/10 dark:bg-black">
				{/* Workflows visual content */}
			</div>
		</article>
	);
}
