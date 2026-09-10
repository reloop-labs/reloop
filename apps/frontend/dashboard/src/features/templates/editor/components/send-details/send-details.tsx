import { useEmailContainerWidth } from "#/features/templates/editor/hooks/use-email-container-width";
import { TemplateFromField } from "./template-from-field";
import { TemplateSubjectField } from "./template-subject-field";

export { TemplateFieldRow } from "./template-field-row";
export { TemplateFromField } from "./template-from-field";
export { TemplateSubjectField } from "./template-subject-field";

export const SendDetails = () => {
	const containerWidth = useEmailContainerWidth();

	return (
		<div
			className="mx-auto mt-4 w-full"
			style={{ maxWidth: `${containerWidth}px` }}
		>
			<TemplateFromField />
			<TemplateSubjectField />
		</div>
	);
};
