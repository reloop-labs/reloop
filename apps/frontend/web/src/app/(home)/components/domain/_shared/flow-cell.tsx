"use client";

import { cn } from "@reloop/ui/cn";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { PAGE_EASE } from "./page-motion";

const FLOW_DELAY = 0.38;
const FLOW_STAGGER = 0.05;
const FLOW_DURATION = 0.42;

export function FlowCell({
	index,
	enabled,
	className,
	children,
}: {
	index: number;
	enabled: boolean;
	className?: string;
	children: ReactNode;
}) {
	const reduceMotion = useReducedMotion();
	const skip = !enabled || reduceMotion;

	return (
		<div className={cn("flex min-w-0 items-center overflow-hidden", className)}>
			{skip ? (
				children
			) : (
				<motion.div
					className="min-w-0 max-w-full"
					initial={{
						opacity: 0,
						clipPath: "inset(0 100% 0 0)",
						filter: "blur(2px)",
					}}
					animate={{
						opacity: 1,
						clipPath: "inset(0 0% 0 0)",
						filter: "blur(0px)",
					}}
					transition={{
						duration: FLOW_DURATION,
						delay: FLOW_DELAY + index * FLOW_STAGGER,
						ease: PAGE_EASE,
					}}
					style={{ willChange: "opacity, filter" }}
				>
					{children}
				</motion.div>
			)}
		</div>
	);
}
