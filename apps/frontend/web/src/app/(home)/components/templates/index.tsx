import { SceneHeader } from "../_shared/scene-header";
import { TemplatesPreview } from "./preview";

export function TemplatesSection() {
	return (
		<article
			id="email-system-templates"
			data-scene="templates"
			className="scroll-mt-28 pt-12 sm:pt-16 lg:pt-16"
		>
			<div className="px-4 sm:px-8 lg:px-12">
				<SceneHeader
					icon="layout"
					color="violet"
					badge="AI Email Templates"
					title="Generate Dynamic Email Templates"
					description="Describe what you need in plain language, generate production-ready emails, and refine every detail with an AI-powered editor built for developers."
					ctaLabel="Explore AI Templates"
					ctaHref="/features/email-templates"
				/>
			</div>

			<TemplatesPreview />
		</article>
	);
}
