import { TemplateFromField } from "./template-from-field";
import { TemplateSubjectField } from "./template-subject-field";

export { TemplateFieldRow } from "./template-field-row";
export { TemplateFromField } from "./template-from-field";
export { TemplateSubjectField } from "./template-subject-field";

export const SendDetails = () => {
	return (
		<div className="mx-auto mt-4 w-full max-w-160">
			<TemplateFromField />
			<TemplateSubjectField />
		</div>
	);
};
