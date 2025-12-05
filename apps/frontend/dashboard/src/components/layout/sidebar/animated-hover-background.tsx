"use client";

import { cn } from "@reloop/ui/cn";
import { AnimatePresence, motion } from "motion/react";

interface AnimatedHoverBackgroundProps {
	rect: DOMRect | undefined;
	tabElement: HTMLElement | undefined;
	className?: string;
	isDanger?: boolean;
}

export const AnimatedHoverBackground: React.FC<AnimatedHoverBackgroundProps> = ({
	rect,
	tabElement,
	className,
	isDanger = false,
}) => {
	if (!rect || !tabElement) return null;

	// Use offsetTop/offsetLeft for position relative to parent container
	const left = tabElement.offsetLeft;
	const top = tabElement.offsetTop;

	return (
		<AnimatePresence>
			{rect && (
				<motion.div
					className={cn(
						"absolute top-0 left-0 rounded-lg",
						isDanger ? "bg-red-alpha-10" : "bg-neutral-alpha-10",
						className,
					)}
					initial={{
						pointerEvents: "none",
						width: rect.width,
						height: rect.height,
						left,
						top,
						opacity: 0,
					}}
					animate={{
						pointerEvents: "none",
						width: rect.width,
						height: rect.height,
						left,
						top,
						opacity: 1,
					}}
					exit={{
						pointerEvents: "none",
						opacity: 0,
						width: rect.width,
						height: rect.height,
						left,
						top,
					}}
					transition={{ duration: 0.14 }}
				/>
			)}
		</AnimatePresence>
	);
};
