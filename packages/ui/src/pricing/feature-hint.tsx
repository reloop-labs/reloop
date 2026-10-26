"use client";

import { HoverCard } from "radix-ui";
import { type ReactNode, useRef, useState } from "react";

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

/**
 * Row label with the wavy underline that opens a FeatureHintCard on hover (pricing and compare tables).
 * Touch screens have no hover, so a tap toggles the card; tapping outside closes it.
 */
export function FeatureHintLabel({
	label,
	children,
}: {
	label: string;
	/** Card content, usually a FeatureHintCard. */
	children: ReactNode;
}) {
	const [open, setOpen] = useState(false);
	const triggerRef = useRef<HTMLSpanElement>(null);
	// Radix ignores touch for hover cards; remember how the last press started so a mouse click doesn't fight the hover.
	const pointerTypeRef = useRef("");

	return (
		<HoverCard.Root
			open={open}
			onOpenChange={setOpen}
			openDelay={100}
			closeDelay={150}
		>
			<HoverCard.Trigger asChild>
				<span
					ref={triggerRef}
					onPointerDown={(event) => {
						pointerTypeRef.current = event.pointerType;
					}}
					onClick={() => {
						if (pointerTypeRef.current === "mouse") return;
						setOpen((current) => !current);
					}}
					className="relative cursor-pointer text-body-default text-text-strong-950 underline decoration-[8%] decoration-text-opaque-disabled decoration-wavy underline-offset-[25%] transition-colors duration-200 hover:decoration-text-strong-950 dark:text-white dark:hover:decoration-white"
				>
					{label}
				</span>
			</HoverCard.Trigger>
			<HoverCard.Portal>
				<HoverCard.Content
					side="top"
					align="start"
					sideOffset={10}
					collisionPadding={16}
					// The trigger toggles on its own, so a tap on it must not also count as "outside".
					onPointerDownOutside={(event) => {
						if (triggerRef.current?.contains(event.target as Node)) {
							event.preventDefault();
						}
					}}
					className="fade-in-0 zoom-in-95 data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 z-50 animate-in outline-none duration-150 data-[state=closed]:animate-out"
				>
					{children}
				</HoverCard.Content>
			</HoverCard.Portal>
		</HoverCard.Root>
	);
}
