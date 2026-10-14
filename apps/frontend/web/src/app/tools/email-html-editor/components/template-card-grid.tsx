"use client";

import {
	blankTemplateExample,
	galleryTemplateExamples,
} from "@reloop/email-templates";
import { toolPath } from "../content";
import {
	BlankPreview,
	EmailPreview,
	TemplateCard,
	withSampleValues,
} from "./template-card";

const previewTemplates = galleryTemplateExamples.map((template) =>
	template.id === blankTemplateExample.id
		? template
		: withSampleValues(template),
);

export function TemplateCardGrid() {
	return (
		<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-12 lg:grid-cols-3">
			{previewTemplates.map((template) => (
				<TemplateCard
					key={template.id}
					href={`${toolPath}/${template.id}`}
					title={template.name}
					ariaLabel={`Open the ${template.name.toLowerCase()} template in the editor`}
					preview={
						template.id === blankTemplateExample.id ? (
							<BlankPreview />
						) : (
							<EmailPreview template={template} />
						)
					}
				/>
			))}
		</div>
	);
}
