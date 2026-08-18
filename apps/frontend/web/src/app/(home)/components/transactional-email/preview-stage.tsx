"use client";

import { useState } from "react";
import { CodeWindow } from "./code-window";
import { EmailPreviewCard } from "./email-preview-card";
import {
	PREVIEW_CARD,
	PREVIEW_CODE,
	PREVIEW_FILES,
	type PreviewTabId,
} from "./preview-scenes";
import { PreviewTabs } from "./preview-tabs";

export function PreviewStage() {
	const [active, setActive] = useState<PreviewTabId>("send");
	const Code = PREVIEW_CODE[active];
	const card = PREVIEW_CARD[active];

	return (
		<div className="bg-[#f4f5f7] dark:bg-[#111]">
			<div className="relative overflow-hidden">
				<div className="relative mx-auto min-h-[28rem] max-w-5xl px-5 pt-12 pb-16 sm:min-h-[32rem] sm:px-8 sm:pt-14 sm:pb-20 lg:px-10">
					<div className="w-full max-w-xl lg:max-w-[34rem]">
						<CodeWindow file={PREVIEW_FILES[active]}>
							<Code />
						</CodeWindow>
					</div>
					<div className="relative z-10 mt-6 w-full max-w-sm lg:absolute lg:top-20 lg:right-8 lg:mt-0 xl:right-12">
						<EmailPreviewCard
							badge={card.badge}
							heading={card.heading}
							body={card.body}
							cta={card.cta}
						/>
					</div>
				</div>
				<div
					aria-hidden
					className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#f4f5f7] dark:from-[#111]"
				/>
			</div>
			<PreviewTabs active={active} onChange={setActive} />
		</div>
	);
}
