"use client";

import { cn } from "@reloop/ui/cn";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";

interface AnimatedHoverBackgroundProps {
	rect: { width: number; height: number } | null;
	tabElement: HTMLElement | null;
	className?: string;
}

export const AnimatedHoverBackground: React.FC<
	AnimatedHoverBackgroundProps
> = ({ rect, tabElement, className }) => {
	// Use offsetTop/offsetLeft for position relative to parent container
	const left = tabElement?.offsetLeft ?? 0;
	const top = tabElement?.offsetTop ?? 0;

	return (
		<AnimatePresence>
			{rect && tabElement && (
				<motion.div
					className={cn(
						"absolute rounded-lg bg-neutral-alpha-10 pointer-events-none z-0",
						className,
					)}
					initial={{
						width: rect.width,
						height: rect.height,
						left,
						top,
						opacity: 0,
					}}
					animate={{
						width: rect.width,
						height: rect.height,
						left,
						top,
						opacity: 1,
					}}
					exit={{
						opacity: 0,
						width: rect.width,
						height: rect.height,
						left,
						top,
					}}
					transition={{
						type: "spring",
						bounce: 0,
						duration: 0.2,
					}}
				/>
			)}
		</AnimatePresence>
	);
};
