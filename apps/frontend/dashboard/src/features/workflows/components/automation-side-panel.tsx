"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/** Same width and ease the main sidebar opens with. */
export const SIDE_PANEL_WIDTH = 480;
export const SIDE_PANEL_TRANSITION = {
	duration: 0.28,
	ease: [0.32, 0.72, 0, 1],
} as const;

/**
 * Runs / Metrics panel beside the canvas. It never overlays: it grows from
 * zero width and pushes the canvas over, fading with its width, and closes
 * the same way back. Its contents keep their full width meanwhile, so nothing
 * inside reflows or squashes.
 */
export function AutomationSidePanel({
	open,
	children,
}: {
	open: boolean;
	children: ReactNode;
}) {
	const reduceMotion = useReducedMotion();
	const transition = reduceMotion ? { duration: 0 } : SIDE_PANEL_TRANSITION;
	return (
		<AnimatePresence initial={false}>
			{open ? (
				<motion.aside
					key="automation-side-panel"
					initial={{ width: 0, opacity: 0 }}
					animate={{ width: SIDE_PANEL_WIDTH, opacity: 1 }}
					exit={{ width: 0, opacity: 0 }}
					transition={transition}
					className="relative z-10 shrink-0 overflow-hidden border-stroke-soft-200 border-r bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-black"
				>
					<div
						className="flex h-full flex-col"
						style={{ width: SIDE_PANEL_WIDTH }}
					>
						{children}
					</div>
				</motion.aside>
			) : null}
		</AnimatePresence>
	);
}
