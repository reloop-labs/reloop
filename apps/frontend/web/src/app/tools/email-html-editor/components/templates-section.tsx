import { SectionHeading } from "./section-heading";
import { TemplateCardGrid } from "./template-card-grid";

export function TemplatesSection() {
	return (
		<section
			id="templates"
			aria-labelledby="templates-heading"
			className="w-full scroll-mt-24 bg-bg-white-0 dark:bg-black"
		>
			<SectionHeading
				id="templates-heading"
				eyebrow="Templates"
				icon="layout"
				title={["Start from a template,", "make it your own"]}
				description="Pick a ready-made email and open it on the canvas. Every block stays editable, and you can paste your own HTML over it."
			/>
			<div className="px-4 py-10 sm:px-8 sm:py-12 lg:px-12">
				<TemplateCardGrid />
			</div>
		</section>
	);
}
