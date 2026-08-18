import { SceneHeader } from "../_shared/scene-header";

export function TemplatesSection() {
	return (
		<article
			id="email-system-templates"
			data-scene="templates"
			className="scroll-mt-28 px-4 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-16"
		>
			<SceneHeader
				icon="file-text"
				iconBgColor="bg-violet-600"
				badge="Reloop Templates"
				title="Code emails like components."
				description="Build dynamic React email templates with live previews, type-safe props, and variable interpolation."
				ctaLabel="Explore Templates"
				ctaHref="/docs/templates"
			/>

			<div className="relative mt-10 min-h-[20rem] overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-6 sm:min-h-[24rem] dark:border-white/10 dark:bg-black">
				{/* Templates visual content */}
			</div>
		</article>
	);
}
