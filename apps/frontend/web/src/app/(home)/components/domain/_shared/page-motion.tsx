"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { type ReactNode, useMemo } from "react";

export const PAGE_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const PAGE_TRANSITION_MS = 560;

const DEFAULT_STAGGER = 0.03;
const DEFAULT_DELAY_CHILDREN = 0.02;

export function createStageVariants(
	staggerChildren = DEFAULT_STAGGER,
	delayChildren = DEFAULT_DELAY_CHILDREN,
): Variants {
	return {
		hidden: { opacity: 1 },
		show: {
			opacity: 1,
			transition: {
				staggerChildren,
				delayChildren,
			},
		},
		exit: {
			opacity: 1,
			transition: {
				staggerChildren: Math.max(0.012, staggerChildren * 0.6),
				staggerDirection: -1,
				when: "afterChildren",
			},
		},
	};
}

export const stageVariants: Variants = createStageVariants();

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
	staggerChildren = DEFAULT_STAGGER,
	delayChildren = DEFAULT_DELAY_CHILDREN,
	orchestrate = false,
}: {
	children: ReactNode;
	className?: string;
	staggerChildren?: number;
	delayChildren?: number;
	/** Drive this subtree itself so nested cards don't inherit the page's 30ms stagger. */
	orchestrate?: boolean;
}) {
	const reduceMotion = useReducedMotion();
	const variants = useMemo(
		() => createStageVariants(staggerChildren, delayChildren),
		[staggerChildren, delayChildren],
	);

	return (
		<motion.div
			className={className}
			variants={variants}
			initial={orchestrate && !reduceMotion ? "hidden" : undefined}
			animate={orchestrate ? "show" : undefined}
			exit={orchestrate ? "exit" : undefined}
		>
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
