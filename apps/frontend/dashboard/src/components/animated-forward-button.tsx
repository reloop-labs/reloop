"use client";

import { cn } from "@reloop/ui/cn";
import { motion } from "framer-motion";
import { useState } from "react";

interface AnimatedForwardButtonProps {
	label?: string;
	onClick?: () => void;
	className?: string;
}

const easing = [0.4, 0, 0.2, 1] as const;
const transition = { duration: 0.22, ease: easing };

export const AnimatedForwardButton = ({
	label = "All plans",
	onClick,
	className,
}: AnimatedForwardButtonProps) => {
	const [hovered, setHovered] = useState(false);

	return (
		<motion.button
			type="button"
			onClick={onClick}
			onHoverStart={() => setHovered(true)}
			onHoverEnd={() => setHovered(false)}
			whileTap={{ scale: 0.96 }}
			className={cn(
				"flex cursor-pointer items-center gap-1.5 py-1.5 font-semibold text-paragraph-sm text-text-sub-600 transition-colors duration-200 hover:text-text-strong-950",
				className,
			)}
		>
			{/* Label */}
			<motion.span
				animate={{ letterSpacing: hovered ? "0.02em" : "0em" }}
				transition={transition}
			>
				{label}
			</motion.span>

			{/* Icon track */}
			<div className="relative flex h-3.5 w-3.5 items-center justify-end">
				{/* Tail — grows from right, anchored to chevron tip */}
				<motion.div
					className="-translate-y-1/2 absolute top-1/2 right-[1.5px] h-[1.5px] rounded-full bg-current"
					initial={{ width: 0, opacity: 0 }}
					animate={{
						width: hovered ? 10 : 0,
						opacity: hovered ? 1 : 0,
					}}
					transition={transition}
				/>
				{/* Chevron — stationary, pointing right */}
				<motion.svg
					width={6}
					height={10}
					viewBox="0 0 6 10"
					fill="none"
					className="absolute right-0"
					transition={transition}
				>
					<path
						d="M1 1L4.5 5L1 9"
						stroke="currentColor"
						strokeWidth={1.5}
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</motion.svg>
			</div>
		</motion.button>
	);
};
