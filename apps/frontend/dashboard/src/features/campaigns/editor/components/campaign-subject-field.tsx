"use client";

import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useCampaignEditorStore } from "../campaign-editor-store";
import { CampaignFieldRow } from "./campaign-field-row";

export const CampaignSubjectField = () => {
	const subject = useCampaignEditorStore((s) => s.subject);
	const setSubject = useCampaignEditorStore((s) => s.setSubject);
	const previewText = useCampaignEditorStore((s) => s.previewText);
	const setPreviewText = useCampaignEditorStore((s) => s.setPreviewText);

	const [showPreview, setShowPreview] = useState(false);

	useEffect(() => {
		if (previewText) {
			setShowPreview(true);
		}
	}, [previewText]);

	return (
		<>
			{/* Subject Row */}
			<CampaignFieldRow
				id="campaign-send-details-subject"
				label="Subject"
				required
				infoTooltip={{
					title: "Email Subject",
					description: "Subject line displayed in the recipient's inbox.",
				}}
			>
				<div className="relative flex w-full flex-1 items-center justify-between gap-2 text-label-sm text-text-sub-600">
					<input
						id="campaign-send-details-subject"
						value={subject}
						onChange={(e) => setSubject(e.target.value)}
						placeholder="Subject line..."
						className="flex-1 bg-transparent text-text-strong-950 outline-none placeholder:text-text-soft-400"
					/>
					<div className="flex items-center gap-2">
						{!showPreview && (
							<button
								type="button"
								onClick={() => setShowPreview(true)}
								className="font-medium text-paragraph-xs text-text-soft-400 transition-colors hover:text-text-strong-950"
							>
								Preview
							</button>
						)}
						<button
							type="button"
							className="flex h-5 w-5 items-center justify-center rounded text-text-soft-400 transition-colors hover:text-text-strong-950 focus:outline-none"
							title="Generate with AI"
							aria-label="Generate subject with AI"
						>
							<Icon name="magic-wand" className="h-3.5 w-3.5" />
						</button>
					</div>
				</div>
			</CampaignFieldRow>

			{/* Preview Row */}
			<AnimatePresence initial={false}>
				{showPreview && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.2, ease: "easeInOut" }}
						className="overflow-hidden"
					>
						<CampaignFieldRow
							id="campaign-send-details-preview-text"
							label="Preview"
							infoTooltip={{
								title: "Preview Text",
								description:
									"Snippet preview text displayed next to or below the subject line in email clients.",
							}}
						>
							<div className="relative flex w-full flex-1 items-center justify-between gap-2 text-label-sm text-text-sub-600">
								<input
									id="campaign-send-details-preview-text"
									value={previewText}
									onChange={(e) => setPreviewText(e.target.value)}
									onBlur={() => {
										if (!previewText.trim()) {
											setShowPreview(false);
										}
									}}
									placeholder="Snippet displayed in inbox preview..."
									className="flex-1 bg-transparent text-label-sm text-text-strong-950 outline-none placeholder:text-text-soft-400"
								/>
								<div className="flex items-center gap-2">
									<button
										type="button"
										className="flex h-5 w-5 items-center justify-center rounded text-text-soft-400 transition-colors hover:text-text-strong-950 focus:outline-none"
										title="Generate with AI"
										aria-label="Generate preview with AI"
									>
										<Icon name="magic-wand" className="h-3.5 w-3.5" />
									</button>
								</div>
							</div>
						</CampaignFieldRow>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
};
