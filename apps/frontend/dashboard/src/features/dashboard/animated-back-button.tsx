import { cn } from "@reloop/ui/cn";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";

interface AnimatedBackButtonProps {
	showEscKey?: boolean;
	shortcut?: "esc" | "mod+backspace" | "none";
	onClick?: () => void;
	showText?: boolean;
	label?: string;
	href?: string;
}

const easing = [0.4, 0, 0.2, 1] as const;
const transition = { duration: 0.22, ease: easing };

export function AnimatedBackButton({
	showEscKey = true,
	shortcut,
	onClick,
	showText = true,
	label = "Back",
	href,
}: AnimatedBackButtonProps) {
	const router = useRouter();
	const [hovered, setHovered] = useState(false);

	const handleBack = () => {
		if (onClick) {
			onClick();
			return;
		}
		if (href) {
			router.push(href);
			return;
		}
		router.back();
	};

	const resolvedShortcut = shortcut ?? (showEscKey ? "esc" : "none");

	useHotkeys(
		"esc",
		(e) => {
			if (
				document.querySelector(
					'[role="dialog"], [role="alertdialog"], [data-radix-popper-content-wrapper]',
				)
			)
				return;
			e.preventDefault();
			handleBack();
		},
		{ enabled: resolvedShortcut === "esc" },
	);

	useHotkeys(
		"mod+backspace",
		(e) => {
			if (
				document.querySelector(
					'[role="dialog"], [role="alertdialog"], [data-radix-popper-content-wrapper]',
				)
			)
				return;
			e.preventDefault();
			handleBack();
		},
		{
			enabled: resolvedShortcut === "mod+backspace",
			enableOnFormTags: false,
		},
	);

	return (
		<motion.button
			type="button"
			onClick={handleBack}
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

				{resolvedShortcut === "esc" && (
					<ActionKbd className="lowercase! w-auto min-w-0 px-1 font-sans text-[10px]">
						esc
					</ActionKbd>
				)}

				{resolvedShortcut === "mod+backspace" && (
					<ActionKbd className="w-auto min-w-0 px-1 font-sans text-[10px]">
						⌘⌫
					</ActionKbd>
				)}
			</motion.div>
		</motion.button>
	);
}
