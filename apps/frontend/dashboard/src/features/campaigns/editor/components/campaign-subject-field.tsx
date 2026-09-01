"use client";

import { useCampaignEditorStore } from "../campaign-editor-store";
import { CampaignFieldRow } from "./campaign-field-row";

export const CampaignSubjectField = () => {
	const subject = useCampaignEditorStore((s) => s.subject);
	const setSubject = useCampaignEditorStore((s) => s.setSubject);

	return (
		<CampaignFieldRow
			id="campaign-send-details-subject"
			label="Subject"
			required
			infoTooltip={{
				title: "Email Subject",
				description: "Subject line displayed in the recipient's inbox.",
			}}
		>
			<input
				id="campaign-send-details-subject"
				value={subject}
				onChange={(e) => setSubject(e.target.value)}
				placeholder="Subject line..."
				className="w-full bg-transparent text-label-sm text-text-strong-950 outline-none placeholder:text-text-soft-400"
			/>
		</CampaignFieldRow>
	);
};
