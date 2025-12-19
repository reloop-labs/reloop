import { InputAlignment } from "@fe/dashboard/app/(protected)/(template-editor)/[orgSlug]/templates/[templateId]/editor/inputs/alignment";
import { InputBackgroundColor } from "@fe/dashboard/app/(protected)/(template-editor)/[orgSlug]/templates/[templateId]/editor/inputs/background-color";
import { InputBorder } from "@fe/dashboard/app/(protected)/(template-editor)/[orgSlug]/templates/[templateId]/editor/inputs/border";
import { InputMargin } from "@fe/dashboard/app/(protected)/(template-editor)/[orgSlug]/templates/[templateId]/editor/inputs/margin";
import { InputPadding } from "@fe/dashboard/app/(protected)/(template-editor)/[orgSlug]/templates/[templateId]/editor/inputs/padding";
import { InputWidth } from "@fe/dashboard/app/(protected)/(template-editor)/[orgSlug]/templates/[templateId]/editor/inputs/width";

export const Editbody = () => {
	return (
		<>
			<div className="border-stroke-soft-100/50 border-b px-4 pt-2 pb-4">
				<InputPadding />
			</div>
			<div className="border-stroke-soft-100/50 border-b px-4 pt-2 pb-4">
				<InputMargin />
			</div>
			<div className="border-stroke-soft-100/50 border-b px-4 pt-2 pb-4">
				<InputBackgroundColor />
			</div>
			<div className="border-stroke-soft-100/50 border-b px-4 pt-2 pb-4">
				<InputBorder />
			</div>
			<div className="border-stroke-soft-100/50 border-b px-4 pt-2 pb-4">
				<InputWidth />
			</div>
			<div className="border-stroke-soft-100/50 border-b px-4 pt-2 pb-4">
				<InputAlignment />
			</div>
		</>
	);
};
