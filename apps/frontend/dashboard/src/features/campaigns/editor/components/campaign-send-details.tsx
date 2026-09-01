"use client";

import { CampaignAudienceField } from "./campaign-audience-field";
import { CampaignFromField } from "./campaign-from-field";
import { CampaignPreviewField } from "./campaign-preview-field";
import { CampaignSubjectField } from "./campaign-subject-field";

export { CampaignAudienceField } from "./campaign-audience-field";
export { CampaignFieldRow } from "./campaign-field-row";
export { CampaignFromField } from "./campaign-from-field";
export { CampaignPreviewField } from "./campaign-preview-field";
export { CampaignSubjectField } from "./campaign-subject-field";

export const CampaignSendDetails = () => {
	return (
		<div className="mx-auto mt-4 w-full max-w-160">
			<CampaignFromField />
			<CampaignAudienceField />
			<CampaignSubjectField />
		</div>
	);
};
