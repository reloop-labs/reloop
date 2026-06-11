"use client";

import { cn } from "@reloop/ui/cn";
import { KbdEsc } from "@reloop/ui/kbd-esc";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

interface AnimatedBackButtonProps {
	showEscKey?: boolean;
	onClick?: () => void;
	showText?: boolean;
}

const easing = [0.4, 0, 0.2, 1] as const;
const transition = { duration: 0.22, ease: easing };

export const AnimatedBackButton = ({
	showEscKey = true,
	onClick,
	showText = true,
}: AnimatedBackButtonProps) => {
	const { back } = useRouter();
	const [hovered, setHovered] = useState(false);

	useHotkeys(
		"esc",
		() => {
			if (
				document.querySelector(
					'[role="dialog"], [role="alertdialog"], [data-radix-popper-content-wrapper]',
				)
			)
				return;
			onClick ? onClick() : back();
		},
		{ enabled: showEscKey },
	);

	return (
		<motion.button
			type="button"
			onClick={onClick ?? back}
			onHoverStart={() => setHovered(true)}
			onHoverEnd={() => setHovered(false)}
			whileTap={{ scale: 0.96 }}
			className={cn(
				"flex cursor-pointer items-center gap-1 py-1.5 font-medium text-text-sub-600 text-xs transition-colors duration-200 hover:text-text-strong-950",
				showText ? "pr-2" : "pr-1",
			)}
		>
			{/* Icon track */}
			<div className="relative flex h-3.5 w-3.5 items-center">
				{/* Tail — grows from left, anchored to chevron tip */}
				<motion.div
					className="-translate-y-1/2 absolute top-1/2 left-[1.5px] h-[1.5px] rounded-full bg-current"
					initial={{ width: 0, opacity: 0 }}
					animate={{
						width: hovered ? 10 : 0,
						opacity: hovered ? 1 : 0,
					}}
					transition={transition}
				/>
				{/* Chevron — stationary */}
				<motion.svg
					width={6}
					height={10}
					viewBox="0 0 6 10"
					fill="none"
					className="absolute left-0"
					transition={transition}
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
				{/* Label */}
				{showText && (
					<motion.span
						animate={{
							letterSpacing: hovered ? "0.02em" : "0em",
						}}
						transition={transition}
					>
						Back
					</motion.span>
				)}

				{showEscKey && <KbdEsc />}
			</motion.div>
		</motion.button>
	);
};
