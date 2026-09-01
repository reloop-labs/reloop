"use client";

import { useCampaignEditorStore } from "../campaign-editor-store";
import { CampaignFieldRow } from "./campaign-field-row";

export const CampaignPreviewField = () => {
	const previewText = useCampaignEditorStore((s) => s.previewText);
	const setPreviewText = useCampaignEditorStore((s) => s.setPreviewText);

	return (
		<CampaignFieldRow
			id="campaign-send-details-preview-text"
			label="Preview"
			infoTooltip={{
				title: "Preview Text",
				description:
					"Snippet preview text displayed next to or below the subject line in email clients.",
			}}
		>
			<input
				id="campaign-send-details-preview-text"
				value={previewText}
				onChange={(e) => setPreviewText(e.target.value)}
				placeholder="Snippet displayed in inbox preview..."
				className="w-full bg-transparent text-label-sm text-text-strong-950 outline-none placeholder:text-text-soft-400"
			/>
		</CampaignFieldRow>
	);
};
