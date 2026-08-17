"use client";

import { type RefObject, useEffect, useState } from "react";
import { AnimateIn } from "../_shared/animate-in";
import type { EmailItem } from "../_shared/data";
import { AnimatedBackButton } from "./animated-back-button";
import { type DetailTabId, EmailDetail } from "./email-detail";

export type { DetailTabId };

export function EmailDetailPage({
	email,
	onBack,
	backButtonRef,
	tabRefs,
	activeTab,
	onTabChange,
}: {
	email: EmailItem;
	onBack?: () => void;
	backButtonRef?: RefObject<HTMLButtonElement | null>;
	tabRefs?: RefObject<Record<DetailTabId, HTMLButtonElement | null>>;
	activeTab?: string;
	onTabChange?: (tab: string) => void;
}) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<div className="mx-auto max-w-3xl overflow-hidden sm:px-8">
			<AnimateIn mounted={mounted} delay={0.02} y={8}>
				<div className="pt-10 pb-8">
					<AnimatedBackButton onClick={onBack} buttonRef={backButtonRef} />
				</div>
			</AnimateIn>
			<EmailDetail
				email={email}
				mounted={mounted}
				activeTab={activeTab}
				onTabChange={onTabChange}
				tabRefs={tabRefs}
			/>
		</div>
	);
}
