import { SceneHeader } from "../_shared/scene-header";

export function TemplatesSection() {
	return (
		<article
			id="email-system-templates"
			data-scene="templates"
			className="scroll-mt-28 px-4 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-16"
		>
			<SceneHeader
				icon="layout"
				color="violet"
				badge="AI Email Templates"
				title="Describe the email. Get a template."
				description="Prompt Reloop, preview the result, then ship. Variables and components stay editable."
				ctaLabel="Explore AI Templates"
				ctaHref="/features/email-templates"
			/>

			<div className="relative mt-10 min-h-[20rem] overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6 sm:min-h-[24rem] dark:border-white/10 dark:bg-black">
				{/* Templates visual content */}
			</div>
		</article>
	);
}
