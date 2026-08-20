"use client";

import { useReducedMotion } from "framer-motion";
import { type RefObject, useEffect, useState } from "react";
import { AnimateIn } from "../_shared/animate-in";
import type { EmailItem } from "../_shared/data";
import { AnimatedBackButton } from "./animated-back-button";
import { type DetailTabId, EmailDetail } from "./email-detail";

export type { DetailTabId };

const STATUS_RANK: Record<string, number> = {
	sent: 0,
	delivered: 1,
	opened: 2,
	clicked: 3,
};

const FORWARD_STATUSES = ["delivered", "opened", "clicked"] as const;
const STATUS_STEP_MS = 1800;
const STATUS_START_MS = 1400;

function statusRank(status: string): number {
	return STATUS_RANK[status.toLowerCase()] ?? -1;
}

function isTerminalStatus(status: string): boolean {
	const value = status.toLowerCase();
	return value === "failed" || value === "bounced" || value === "spam";
}

function cloneEmail(email: EmailItem): EmailItem {
	return { ...email };
}

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
	const [session, setSession] = useState<EmailItem>(() => cloneEmail(email));
	const reduceMotion = useReducedMotion();

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		const snapshot = cloneEmail(email);
		setSession(snapshot);

		if (reduceMotion || isTerminalStatus(snapshot.status)) return;

		const remaining = FORWARD_STATUSES.filter(
			(status) => statusRank(status) > statusRank(snapshot.status),
		);
		if (remaining.length === 0) return;

		const timers = remaining.map((status, index) =>
			window.setTimeout(
				() => {
					setSession((current) => {
						if (current.id !== snapshot.id) return current;
						if (statusRank(status) <= statusRank(current.status)) {
							return current;
						}
						return { ...current, status };
					});
				},
				STATUS_START_MS + index * STATUS_STEP_MS,
			),
		);

		return () => {
			for (const id of timers) window.clearTimeout(id);
		};
	}, [email, reduceMotion]);

	return (
		<div className="mx-auto max-w-3xl overflow-hidden sm:px-8">
			<AnimateIn mounted={mounted} delay={0.02} y={8}>
				<div className="pt-10 pb-8">
					<AnimatedBackButton onClick={onBack} buttonRef={backButtonRef} />
				</div>
			</AnimateIn>
			<EmailDetail
				email={session}
				mounted={mounted}
				activeTab={activeTab}
				onTabChange={onTabChange}
				tabRefs={tabRefs}
			/>
		</div>
	);
}
