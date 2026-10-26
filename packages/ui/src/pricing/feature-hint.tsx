"use client";

import { HoverCard } from "radix-ui";
import type { ReactNode } from "react";

/** Hover card body: icon + feature name, then a one-line explanation. */
export function FeatureHintCard({
	label,
	description,
	icon,
}: {
	label: string;
	description: string;
	icon?: ReactNode;
}) {
	return (
		<div className="w-[280px] rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-4 dark:border-white/10 dark:bg-[#121212]">
			<div className="flex items-center gap-2">
				{icon}
				<h4 className="font-medium text-[14px] text-text-strong-950 dark:text-white">
					{label}
				</h4>
			</div>
			<p className="mt-1.5 text-[13px] text-text-sub-600 leading-relaxed dark:text-white/70">
				{description}
			</p>
		</div>
	);
}

/** Row label with the wavy underline that opens a FeatureHintCard on hover (pricing and compare tables). */
export function FeatureHintLabel({
	label,
	children,
}: {
	label: string;
	/** Card content, usually a FeatureHintCard. */
	children: ReactNode;
}) {
	return (
		<HoverCard.Root openDelay={100} closeDelay={150}>
			<HoverCard.Trigger asChild>
				<span className="relative cursor-pointer text-body-default text-text-strong-950 underline decoration-[8%] decoration-text-opaque-disabled decoration-wavy underline-offset-[25%] transition-colors duration-200 hover:decoration-text-strong-950 dark:text-white dark:hover:decoration-white">
					{label}
				</span>
			</HoverCard.Trigger>
			<HoverCard.Portal>
				<HoverCard.Content
					side="top"
					align="start"
					sideOffset={10}
					collisionPadding={16}
					className="fade-in-0 zoom-in-95 data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 z-50 animate-in outline-none duration-150 data-[state=closed]:animate-out"
				>
					{children}
				</HoverCard.Content>
			</HoverCard.Portal>
		</HoverCard.Root>
	);
}
