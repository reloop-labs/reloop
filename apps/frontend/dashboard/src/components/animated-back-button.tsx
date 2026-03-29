"use client";

import * as Kbd from "@reloop/ui/kbd";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AnimatedBackButtonProps {
	showEscKey?: boolean;
	onClick?: () => void;
}

export const AnimatedBackButton = ({
	showEscKey = true,
	onClick,
}: AnimatedBackButtonProps) => {
	const { back } = useRouter();

	useEffect(() => {
		if (!showEscKey) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				// Prevent back navigation if a Radix dialog, alertdialog, or popover is open
				if (
					document.querySelector(
						'[role="dialog"], [role="alertdialog"], [data-radix-popper-content-wrapper]',
					)
				) {
					return;
				}

				if (onClick) {
					onClick();
				} else {
					back();
				}
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [back, showEscKey, onClick]);

	return (
		<button
			type="button"
			onClick={onClick || back}
			className="group flex cursor-pointer items-center gap-1.5 py-1.5 pr-2 font-medium text-paragraph-xs text-text-sub-600 transition-all duration-300 hover:text-text-strong-950"
		>
			<div className="relative flex h-3.5 w-3.5 items-center justify-center overflow-visible">
				{/* Arrow tail - hidden by default, slides in from left on hover */}
				<div className="absolute left-0 h-[1.25px] w-0 bg-current transition-all duration-300 ease-out group-hover:w-2" />
				{/* Chevron/Arrow head - nudges left on hover */}
				<svg
					width="6"
					height="10"
					viewBox="0 0 8 12"
					fill="none"
					className="group-hover:-translate-x-0.5 absolute left-0 transition-all duration-300 ease-out"
				>
					<path
						d="M7 1L1.5 6L7 11"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</div>
			<span className="text-xs transition-all duration-300 group-hover:tracking-wide">
				Back
			</span>
			{showEscKey && (
				<Kbd.Root className="bg-bg-weak-50 px-1.5 py-0.5 text-[10px]">
					Esc
				</Kbd.Root>
			)}
		</button>
	);
};
