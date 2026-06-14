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
						"pointer-events-none absolute left-0 top-0 z-0 rounded-lg bg-neutral-alpha-10",
						className,
					)}
					style={{
						width: rect.width,
						height: rect.height,
						willChange: "transform, opacity",
					}}
					initial={{
						x: rect.left,
						y: rect.top,
						opacity: 0,
					}}
					animate={{
						x: rect.left,
						y: rect.top,
						opacity: 1,
					}}
					exit={{
						x: rect.left,
						y: rect.top,
						opacity: 0,
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

