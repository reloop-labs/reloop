"use client";

import { cn } from "@reloop/ui/cn";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useSidebarHoverBox } from "#/features/dashboard/sidebar/use-sidebar-hover-box";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";
import { nodeTone } from "../node-tone";
import { NODE_WIDTH, SNAPPY_EASE } from "./editors/editor-shell";
import type { MorphFrom, StepKind } from "./node-editor-context";
import { StepIcon } from "./step-icon";

const STEPS: { kind: StepKind; description: string }[] = [
	{ kind: "send_email", description: "Send a template to the contact" },
	{ kind: "delay", description: "Wait before the next step" },
	{ kind: "condition", description: "Split into Yes and No paths" },
];

interface StepPickerProps {
	/**
	 * Flow-space point the menu hangs from (bottom center of the clicked "+").
	 * Omit it to render the menu in the flow, as a step box (see PickerNode).
	 */
	anchor?: { x: number; y: number };
	/** `from` is where the menu sat, so the new step can grow out of it. */
	onPick: (kind: StepKind, from: MorphFrom) => void;
	onClose: () => void;
	/** Draw the line from the "+"/"×" down to the menu (not when the menu sits over a step). */
	connector?: boolean;
}

/** Gap between the "+" and the menu's top, and the tab's height (minus its 1px overlap). */
const GAP_BELOW_BUTTON = 8;
const TAB_HEIGHT = 35;

/**
 * Menu of step types that drops down below a "+" on the canvas. It's built
 * like a step (tab on top, gray frame, white card) so that picking a type
 * reads as this box turning into the new step.
 */
export const StepPicker = ({
	anchor,
	onPick,
	onClose,
	connector = true,
}: StepPickerProps) => {
	const rootRef = useRef<HTMLDivElement>(null);
	const frameRef = useRef<HTMLDivElement>(null);
	const tabRef = useRef<HTMLParagraphElement>(null);
	const listRef = useRef<HTMLDivElement>(null);
	const reduceMotion = useReducedMotion();
	// Same sliding hover pill as the sidebar. Nothing is highlighted until the
	// pointer or the arrow keys pick a row.
	const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);
	const [hoveredEl, setHoveredEl] = useState<HTMLElement | undefined>();
	const [focusedEl, setFocusedEl] = useState<HTMLElement | undefined>();
	const hoverBox = useSidebarHoverBox(hoveredEl ?? focusedEl, containerEl);

	useEffect(() => {
		// Focus the menu itself (not a row) so keys work without a highlight.
		listRef.current?.focus({ preventScroll: true });
	}, []);

	const moveFocus = (delta: number) => {
		const items = Array.from(
			listRef.current?.querySelectorAll<HTMLButtonElement>("button") ?? [],
		);
		const index = items.indexOf(document.activeElement as HTMLButtonElement);
		const next =
			index === -1
				? items[delta > 0 ? 0 : items.length - 1]
				: items[(index + delta + items.length) % items.length];
		next?.focus();
	};

	const pick = (kind: StepKind) => {
		const root = rootRef.current?.getBoundingClientRect();
		const frame = frameRef.current?.getBoundingClientRect();
		const card = listRef.current?.getBoundingClientRect();
		const iconEl = containerEl?.querySelector(`[data-step-tile="${kind}"] svg`);
		const icon = iconEl?.getBoundingClientRect();
		// Snapshot the rows as they look right now; the picked icon is left out
		// because the real one flies into the new step's input.
		const ghost = containerEl?.cloneNode(true) as HTMLElement | undefined;
		ghost
			?.querySelector<HTMLElement>(`[data-step-tile="${kind}"] svg`)
			?.style.setProperty("visibility", "hidden");
		onPick(kind, {
			top: root?.top ?? 0,
			frameHeight: frame?.height ?? 0,
			cardHeight: card?.height ?? 0,
			icon: icon
				? {
						left: icon.left,
						top: icon.top,
						width: icon.width,
						height: icon.height,
					}
				: undefined,
			ghost,
			tabGhost: tabRef.current?.cloneNode(true) as HTMLElement | undefined,
		});
	};

	return (
		<motion.div
			ref={rootRef}
			// The editor finds the floating menu by this to pan it into view.
			data-step-picker={anchor ? "" : undefined}
			className={cn(
				"nodrag nopan nowheel pointer-events-auto flex cursor-default flex-col",
				anchor && "absolute z-50",
			)}
			style={{
				width: NODE_WIDTH,
				...(anchor
					? {
							left: anchor.x - NODE_WIDTH / 2,
							top: anchor.y + GAP_BELOW_BUTTON,
						}
					: {}),
				transformOrigin: "top center",
			}}
			initial={
				// In the flow, PickerNode drives the reveal from its height.
				reduceMotion || !anchor ? false : { opacity: 0, y: -6, scale: 0.97 }
			}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			exit="exit"
			variants={{
				// `morphing` comes from AnimatePresence's `custom`: the new step
				// takes over this exact spot, so just get out of the way.
				exit: (morphing: boolean) =>
					morphing || reduceMotion
						? { opacity: 0, transition: { duration: 0.05 } }
						: {
								opacity: 0,
								y: -4,
								scale: 0.98,
								transition: { duration: 0.12, ease: SNAPPY_EASE },
							},
			}}
			transition={{ duration: 0.16, ease: SNAPPY_EASE }}
			onPointerDown={(e) => e.stopPropagation()}
		>
			{connector && anchor ? (
				// Plain gray line (no arrowhead) from the "×" down to the box.
				<span
					aria-hidden
					className="pointer-events-none absolute left-1/2 w-[2px] -translate-x-1/2 rounded-full bg-stroke-sub-300"
					style={{
						top: -GAP_BELOW_BUTTON,
						height: GAP_BELOW_BUTTON + TAB_HEIGHT,
					}}
				/>
			) : null}
			<p
				ref={tabRef}
				className="relative z-10 -mb-px ml-4 flex h-9 w-fit items-center rounded-t-xl border border-stroke-soft-200 border-b-0 bg-bg-weak-50 px-3.5 font-medium text-[14px] text-text-sub-600 dark:border-stroke-soft-100/50 dark:bg-[#101014]"
			>
				<StepIcon name="plus" className="mr-2 h-3.5 w-3.5" />
				Add a step
			</p>
			<div
				ref={frameRef}
				className="rounded-[15px] border border-stroke-soft-200 bg-bg-weak-50 p-[3px] dark:border-stroke-soft-100/50 dark:bg-[#101014]"
			>
				<div
					ref={listRef}
					role="menu"
					aria-label="Add a step"
					tabIndex={-1}
					onKeyDown={(e) => {
						e.stopPropagation();
						if (e.key === "ArrowDown") {
							e.preventDefault();
							moveFocus(1);
						} else if (e.key === "ArrowUp") {
							e.preventDefault();
							moveFocus(-1);
						} else if (e.key === "Escape") {
							e.preventDefault();
							onClose();
						}
					}}
					className="overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 outline-none dark:border-stroke-soft-100/50 dark:bg-[#141419]"
				>
					<div
						ref={setContainerEl}
						className="relative"
						onPointerLeave={() => setHoveredEl(undefined)}
					>
						<div className="divide-y divide-stroke-soft-200 dark:divide-stroke-soft-100/50">
							{STEPS.map((step) => (
								<StepRow
									key={step.kind}
									step={step}
									onPick={pick}
									onHover={setHoveredEl}
									onFocusRow={setFocusedEl}
								/>
							))}
						</div>
						<AnimatedHoverBackground box={hoverBox} className="rounded-none" />
					</div>
				</div>
			</div>
		</motion.div>
	);
};

const StepRow = ({
	step,
	onPick,
	onHover,
	onFocusRow,
}: {
	step: (typeof STEPS)[number];
	onPick: (kind: StepKind) => void;
	onHover: (el: HTMLElement) => void;
	onFocusRow: (el: HTMLElement) => void;
}) => {
	const meta = nodeTone[step.kind];
	return (
		<button
			type="button"
			role="menuitem"
			onPointerEnter={(e) => onHover(e.currentTarget)}
			onFocus={(e) => {
				// Keyboard focus only; a mouse click shouldn't flash the pill.
				if (e.currentTarget.matches(":focus-visible"))
					onFocusRow(e.currentTarget);
			}}
			onClick={(e) => {
				e.stopPropagation();
				onPick(step.kind);
			}}
			className={cn(
				"group relative z-10 flex w-full items-center gap-4 px-4 py-3.5 text-left outline-none",
			)}
		>
			<span
				data-step-tile={step.kind}
				className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-bg-weak-50 dark:bg-white/[0.06]"
			>
				<StepIcon name={meta.icon} className="h-5 w-5 text-text-strong-950" />
			</span>
			<span className="min-w-0 flex-1">
				<span className="block font-medium text-[16px] text-text-strong-950 leading-6">
					{meta.label}
				</span>
				<span className="block truncate text-[14px] text-text-sub-600 leading-5">
					{step.description}
				</span>
			</span>
			<StepIcon
				name="plus"
				className="text-text-soft-400 transition-colors group-hover:text-text-strong-950 group-focus-visible:text-text-strong-950"
			/>
		</button>
	);
};
