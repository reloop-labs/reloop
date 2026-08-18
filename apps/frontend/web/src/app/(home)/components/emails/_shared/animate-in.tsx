"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { PAGE_EASE } from "../../domain/_shared/page-motion";

export function AnimateIn({
	mounted,
	delay = 0,
	y = 14,
	className,
	children,
}: {
	mounted: boolean;
	delay?: number;
	y?: number;
	className?: string;
	children: ReactNode;
}) {
	const reduceMotion = useReducedMotion();
	if (reduceMotion) {
		return <div className={className}>{children}</div>;
	}

	return (
		<motion.div
			className={className}
			initial={{ opacity: 0, y, filter: "blur(4px)" }}
			animate={
				mounted
					? { opacity: 1, y: 0, filter: "blur(0px)" }
					: { opacity: 0, y, filter: "blur(4px)" }
			}
			transition={{
				duration: 0.55,
				delay,
				ease: PAGE_EASE,
			}}
			style={{ willChange: "transform, opacity, filter" }}
		>
			{children}
		</motion.div>
	);
}
