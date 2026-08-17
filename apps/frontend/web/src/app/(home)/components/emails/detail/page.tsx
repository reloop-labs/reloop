"use client";

import type { RefObject } from "react";
import type { EmailItem } from "../_shared/data";
import { AnimatedBackButton } from "./animated-back-button";
import { EmailDetail } from "./email-detail";

export function EmailDetailPage({
	email,
	onBack,
	backButtonRef,
	tabPreviewRef,
	tabInsightsRef,
	activeTab,
	onTabChange,
}: {
	email: EmailItem;
	onBack?: () => void;
	backButtonRef?: RefObject<HTMLButtonElement | null>;
	tabPreviewRef?: RefObject<HTMLButtonElement | null>;
	tabInsightsRef?: RefObject<HTMLButtonElement | null>;
	activeTab?: string;
	onTabChange?: (tab: string) => void;
}) {
	return (
		<div className="mx-auto max-w-3xl sm:px-8">
			<div className="pt-10 pb-8">
				<AnimatedBackButton onClick={onBack} buttonRef={backButtonRef} />
			</div>
			<EmailDetail
				email={email}
				activeTab={activeTab}
				onTabChange={onTabChange}
				tabPreviewRef={tabPreviewRef}
				tabInsightsRef={tabInsightsRef}
			/>
		</div>
	);
}
