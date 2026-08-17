"use client";

import { cn } from "@reloop/ui/cn";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { PAGE_EASE } from "../../domain/_shared/page-motion";

export const WAVE_DELAY = 0.16;
export const WAVE_STAGGER = 0.045;
export const CELL_DURATION = 0.44;

export function MatrixCell({
	mounted,
	row,
	col,
	className,
	children,
}: {
	mounted: boolean;
	row: number;
	col: number;
	className?: string;
	children: ReactNode;
}) {
	const reduceMotion = useReducedMotion();

	return (
		<div className={cn("flex min-w-0 items-center", className)}>
			{reduceMotion ? (
				children
			) : (
				<motion.div
					className="min-w-0 max-w-full"
					initial={{ opacity: 0, y: 8, filter: "blur(2px)" }}
					animate={
						mounted
							? { opacity: 1, y: 0, filter: "blur(0px)" }
							: { opacity: 0, y: 8, filter: "blur(2px)" }
					}
					transition={{
						duration: CELL_DURATION,
						delay: WAVE_DELAY + (row + col) * WAVE_STAGGER,
						ease: PAGE_EASE,
					}}
					style={{ willChange: "transform, opacity, filter" }}
				>
					{children}
				</motion.div>
			)}
		</div>
	);
}
