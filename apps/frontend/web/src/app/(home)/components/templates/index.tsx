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
					title="Describe the email. Get a template."
					description="Prompt Reloop, preview the result, then ship. Variables and components stay editable."
					ctaLabel="Explore AI Templates"
					ctaHref="/features/email-templates"
				/>
			</div>

			<TemplatesPreview />
		</article>
	);
}
