import { cn } from "@reloop/ui/cn";
import { useEmailContainerWidth } from "#/features/templates/editor/hooks/use-email-container-width";
import { useCampaignEditorStore } from "../campaign-editor-store";
import { CampaignAudienceField } from "./campaign-audience-field";
import { CampaignFromField } from "./campaign-from-field";
import { CampaignSubjectField } from "./campaign-subject-field";

export { CampaignAudienceField } from "./campaign-audience-field";
export { CampaignFieldRow } from "./campaign-field-row";
export { CampaignFromField } from "./campaign-from-field";
export { CampaignPreviewField } from "./campaign-preview-field";
export { CampaignSubjectField } from "./campaign-subject-field";

export const CampaignSendDetails = () => {
	const containerWidth = useEmailContainerWidth();
	const isReadOnly = useCampaignEditorStore((s) => s.status !== "draft");

	return (
		<div
			className={cn(
				"mx-auto mt-4 w-full",
				isReadOnly && "pointer-events-none select-text",
			)}
			aria-disabled={isReadOnly}
			style={{ maxWidth: `${containerWidth}px` }}
		>
			<CampaignFromField />
			<CampaignAudienceField />
			<CampaignSubjectField />
		</div>
	);
};
