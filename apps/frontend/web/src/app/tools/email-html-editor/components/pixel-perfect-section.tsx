"use client";

import { acmeTemplateExamples } from "@reloop/email-templates";
import { SectionHeading } from "../../components/section-heading";
import { toolPath } from "../content";
import {
	CARD_ONLY_PREVIEW_CSS,
	EmailPreview,
	ShowMoreGrid,
	TemplateCard,
	withSampleValues,
} from "./template-card";

const previewTemplates = acmeTemplateExamples.map(withSampleValues);

export function PixelPerfectSection() {
	return (
		<section
			id="pixel-perfect"
			aria-labelledby="pixel-perfect-heading"
			className="w-full scroll-mt-24 bg-bg-white-0 dark:bg-black"
		>
			<SectionHeading
				id="pixel-perfect-heading"
				eyebrow="Pixel-perfect"
				icon="paint-bucket"
				title={["Pixel-perfect templates", "for every transactional email"]}
				description={`${previewTemplates.length} transactional emails from one design system, with the same type, spacing, and components. Open any of them and make it yours.`}
			/>

			<ShowMoreGrid id="pixel-perfect-grid">
				{previewTemplates.map((template) => (
					<TemplateCard
						key={template.id}
						href={`${toolPath}/${template.id}`}
						title={template.name}
						ariaLabel={`Open the ${template.name.toLowerCase()} template in the editor`}
						preview={
							<EmailPreview
								template={template}
								previewCss={CARD_ONLY_PREVIEW_CSS}
							/>
						}
					/>
				))}
			</ShowMoreGrid>
		</section>
	);
}
