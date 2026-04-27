"use client";

import { KbdEsc } from "@reloop/ui/kbd-esc";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

interface AnimatedBackButtonProps {
	showEscKey?: boolean;
	onClick?: () => void;
}

const easing = [0.4, 0, 0.2, 1] as const;
const transition = { duration: 0.22, ease: easing };

export const AnimatedBackButton = ({
	showEscKey = true,
	onClick,
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
			className="flex cursor-pointer items-center gap-1 py-1.5 pr-2 font-medium text-text-sub-600 text-xs transition-colors duration-200 hover:text-text-strong-950"
		>
			{/* Icon track */}
			<div className="relative flex h-3.5 w-4 items-center">
				{/* Tail — grows from left, anchored to chevron tip */}
				<motion.div
					className="-translate-y-1/2 absolute top-1/2 left-[2px] h-[1.5px] rounded-full bg-current"
					initial={{ width: 0, opacity: 0 }}
					animate={{
						width: hovered ? 12 : 0,
						opacity: hovered ? 1 : 0,
					}}
					transition={transition}
				/>
				{/* Chevron — stationary */}
				<motion.svg
					width={8}
					height={11}
					viewBox="0 0 8 11"
					fill="none"
					className="absolute left-0"
					transition={transition}
				>
					<path
						d="M6.5 1.5L2 5.5L6.5 9.5"
						stroke="currentColor"
						strokeWidth={1.5}
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</motion.svg>
			</div>
			<motion.div className="flex items-center gap-1.5" transition={transition}>
				{/* Label */}
				<motion.span
					animate={{
						letterSpacing: hovered ? "0.02em" : "0em",
					}}
					transition={transition}
				>
					Back
				</motion.span>

				{showEscKey && <KbdEsc />}
			</motion.div>
		</motion.button>
	);
};
