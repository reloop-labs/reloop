"use client";

import { KbdEsc } from "@reloop/ui/kbd-esc";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

	useEffect(() => {
		if (!showEscKey) return;
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				if (
					document.querySelector(
						'[role="dialog"], [role="alertdialog"], [data-radix-popper-content-wrapper]',
					)
				)
					return;
				onClick ? onClick() : back();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [back, showEscKey, onClick]);

	return (
		<motion.button
			type="button"
			onClick={onClick ?? back}
			onHoverStart={() => setHovered(true)}
			onHoverEnd={() => setHovered(false)}
			whileTap={{ scale: 0.96 }}
			className="flex cursor-pointer items-center gap-1.5 py-1.5 pr-2 font-medium text-text-sub-600 text-xs transition-colors duration-200 hover:text-text-strong-950"
		>
			{/* Icon track */}
			<div className="relative flex h-3.5 w-5 items-center">
				{/* Tail — grows from right, anchored to chevron */}
				<motion.div
					className="-translate-y-1/2 absolute top-1/2 right-0 h-[1.5px] rounded-full bg-current"
					animate={{ width: hovered ? 10 : 0, opacity: hovered ? 1 : 0 }}
					transition={transition}
				/>
				{/* Chevron — slides left to reveal the tail */}
				<motion.svg
					width={8}
					height={12}
					viewBox="0 0 8 12"
					fill="none"
					className="absolute right-0"
					animate={{ x: hovered ? -10 : 0 }}
					transition={transition}
				>
					<path
						d="M7 1L1.5 6L7 11"
						stroke="currentColor"
						strokeWidth={1.5}
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</motion.svg>
			</div>

			{/* Label */}
			<motion.span
				animate={{ letterSpacing: hovered ? "0.02em" : "0em" }}
				transition={transition}
			>
				Back
			</motion.span>

			{showEscKey && <KbdEsc />}
		</motion.button>
	);
};
