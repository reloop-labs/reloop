"use client";

import { cn } from "@reloop/ui/cn";
import { AnimatePresence, motion } from "framer-motion";

export type HoverBox = {
	left: number;
	top: number;
	width: number;
	height: number;
};

interface AnimatedHoverBackgroundProps {
	box?: HoverBox | null;
	className?: string;
}

/**
 * Sliding hover / active highlight identical to the dashboard sidebar.
 */
export function AnimatedHoverBackground({
	box,
	className,
}: AnimatedHoverBackgroundProps) {
	return (
		<AnimatePresence>
			{box && box.width > 0 && box.height > 0 ? (
				<motion.div
					className={cn(
						"pointer-events-none absolute top-0 left-0 z-0 rounded-lg bg-neutral-alpha-10 dark:bg-white/[0.08]",
						className,
					)}
					initial={false}
					animate={{
						width: box.width,
						height: box.height,
						left: box.left,
						top: box.top,
						opacity: 1,
					}}
					exit={{
						opacity: 0,
						width: box.width,
						height: box.height,
						left: box.left,
						top: box.top,
					}}
					transition={{
						type: "spring",
						bounce: 0,
						duration: 0.2,
					}}
				/>
			) : null}
		</AnimatePresence>
	);
}
