"use client";

import { cn } from "@reloop/ui/cn";
import { KbdKey } from "@reloop/ui/kbd-key";
import { motion } from "framer-motion";
import { type RefObject, useState } from "react";

const easing = [0.4, 0, 0.2, 1] as const;
const transition = { duration: 0.22, ease: easing };

export function AnimatedBackButton({
	showEscKey = true,
	onClick,
	showText = true,
	label = "Back",
	buttonRef,
}: {
	showEscKey?: boolean;
	onClick?: () => void;
	showText?: boolean;
	label?: string;
	buttonRef?: RefObject<HTMLButtonElement | null>;
}) {
	const [hovered, setHovered] = useState(false);

	return (
		<motion.button
			ref={buttonRef}
			type="button"
			onClick={onClick}
			onHoverStart={() => setHovered(true)}
			onHoverEnd={() => setHovered(false)}
			whileTap={{ scale: 0.96 }}
			className={cn(
				"flex cursor-pointer items-center gap-1 py-1.5 font-medium text-text-sub-600 text-xs transition-colors duration-200 hover:text-text-strong-950",
				showText ? "pr-2" : "pr-1",
			)}
		>
			<div className="relative flex h-3.5 w-3.5 items-center">
				<motion.div
					className="-translate-y-1/2 absolute top-1/2 left-[1.5px] h-[1.5px] rounded-full bg-current"
					initial={{ width: 0, opacity: 0 }}
					animate={{
						width: hovered ? 10 : 0,
						opacity: hovered ? 1 : 0,
					}}
					transition={transition}
				/>
				<motion.svg
					width={6}
					height={10}
					viewBox="0 0 6 10"
					fill="none"
					className="absolute left-0"
					transition={transition}
					aria-hidden
				>
					<path
						d="M5 1L1.5 5L5 9"
						stroke="currentColor"
						strokeWidth={1.5}
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</motion.svg>
			</div>
			<motion.div className="flex items-center gap-1.5" transition={transition}>
				{showText && (
					<motion.span
						animate={{
							letterSpacing: hovered ? "0.02em" : "0em",
						}}
						transition={transition}
					>
						{label}
					</motion.span>
				)}

				{showEscKey && (
					<KbdKey className="lowercase! w-auto min-w-0 px-1 font-sans text-[10px]">
						esc
					</KbdKey>
				)}
			</motion.div>
		</motion.button>
	);
}
