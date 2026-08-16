"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

export const PAGE_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const PAGE_TRANSITION_MS = 560;

export const stageVariants: Variants = {
	hidden: { opacity: 1 },
	show: {
		opacity: 1,
		transition: {
			staggerChildren: 0.03,
			delayChildren: 0.02,
		},
	},
	exit: {
		opacity: 1,
		transition: {
			staggerChildren: 0.018,
			staggerDirection: -1,
			when: "afterChildren",
		},
	},
};

const itemVariants: Variants = {
	hidden: {
		opacity: 0,
		y: 6,
		scale: 0.99,
		filter: "blur(2px)",
	},
	show: {
		opacity: 1,
		y: 0,
		scale: 1,
		filter: "blur(0px)",
		transition: {
			type: "spring",
			bounce: 0,
			duration: 0.62,
		},
	},
	exit: {
		opacity: 0,
		y: 0,
		scale: 1,
		filter: "blur(0px)",
		transition: {
			duration: 0.26,
			ease: PAGE_EASE,
		},
	},
};

export function MotionStage({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<motion.div className={className} variants={stageVariants}>
			{children}
		</motion.div>
	);
}

export function MotionItem({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<motion.div
			className={className}
			variants={itemVariants}
			style={{ willChange: "transform, opacity, filter" }}
		>
			{children}
		</motion.div>
	);
}
