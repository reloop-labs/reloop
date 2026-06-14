"use client";

import { motion } from "framer-motion";

interface ActivePillProps {
	color: string;
	active: boolean;
}

export function ActivePill({ color, active }: ActivePillProps) {
	return (
		<motion.div
			layoutId="nav-pill"
			className="-z-10 absolute inset-x-1 inset-y-2 rounded-lg"
			style={{
				backgroundColor: active
					? `color-mix(in srgb, ${color} 12%, transparent)`
					: `color-mix(in srgb, ${color} 8%, transparent)`,
			}}
			transition={{ type: "spring", stiffness: 350, damping: 30 }}
		/>
	);
}

interface ActiveUnderlineProps {
	color: string;
}

export function ActiveUnderline({ color }: ActiveUnderlineProps) {
	return (
		<motion.div
			layoutId="nav-active-underline"
			className="absolute right-1 bottom-0 left-1 h-[2px] rounded-full"
			style={{ backgroundColor: color }}
			transition={{ type: "spring", stiffness: 350, damping: 30 }}
		/>
	);
}
