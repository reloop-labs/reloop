"use client";

import { cn } from "@reloop/ui/cn";
import { AnimatePresence, motion } from "framer-motion";
import type React from "react";

interface AnimatedHoverBackgroundProps {
	rect: { width: number; height: number; top: number; left: number } | null;
	className?: string;
}

export const AnimatedHoverBackground: React.FC<
	AnimatedHoverBackgroundProps
> = ({ rect, className }) => {
	return (
		<AnimatePresence>
			{rect && (
				<motion.div
					className={cn(
						"pointer-events-none absolute z-0 rounded-lg bg-neutral-alpha-10",
						className,
					)}
					initial={{
						width: rect.width,
						height: rect.height,
						left: rect.left,
						top: rect.top,
						opacity: 0,
					}}
					animate={{
						width: rect.width,
						height: rect.height,
						left: rect.left,
						top: rect.top,
						opacity: 1,
					}}
					exit={{
						opacity: 0,
						width: rect.width,
						height: rect.height,
						left: rect.left,
						top: rect.top,
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
