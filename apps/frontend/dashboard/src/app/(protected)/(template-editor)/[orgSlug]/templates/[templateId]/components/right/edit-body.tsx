import { InputMargin } from "@fe/dashboard/app/(protected)/(template-editor)/[orgSlug]/templates/[templateId]/editor/inputs/margin";
import { InputPadding } from "@fe/dashboard/app/(protected)/(template-editor)/[orgSlug]/templates/[templateId]/editor/inputs/padding";

export const Editbody = () => {
	return (
		<>
			<div className="border-stroke-soft-100/50 border-b px-4 pt-2 pb-4">
				<InputPadding />
			</div>
			<div className="border-stroke-soft-100/50 border-b px-4 pt-2 pb-4">
				<InputMargin />
			</div>
		</>
	);
};
