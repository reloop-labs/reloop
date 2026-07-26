import { cn } from "@reloop/ui/cn";
import type React from "react";

/**
 * Diagonal hatch gutter cell.
 * Uses currentColor stripes so light/dark both stay visible.
 */
function HatchCell({ className }: { className?: string }) {
	return (
		<div
			aria-hidden
			className={cn(
				"hidden min-h-[1px] self-stretch border-stroke-soft-200 border-y text-text-strong-950/20 sm:block dark:border-white/15 dark:text-white/20",
				className,
			)}
			style={{
				backgroundImage:
					"repeating-linear-gradient(-45deg, transparent 0, transparent 5px, currentColor 5px, currentColor 6.5px)",
			}}
		/>
	);
}

/**
 * Content flanked by full-height diagonal hatch gutters (Dub-style).
 * Side columns take leftover width so hatches meet the page rails.
 */
export function CompareHatchFrame({
	children,
	className,
	contentClassName,
}: {
	children: React.ReactNode;
	className?: string;
	contentClassName?: string;
}) {
	return (
		<div
			className={cn(
				"grid w-full grid-cols-1 items-stretch sm:grid-cols-[minmax(2.5rem,1fr)_minmax(0,42rem)_minmax(2.5rem,1fr)] lg:grid-cols-[minmax(3.5rem,1fr)_minmax(0,48rem)_minmax(3.5rem,1fr)]",
				className,
			)}
		>
			{/* Left gutter */}
			<HatchCell className="border-r" />

			{/* Center content */}
			<div
				className={cn(
					"min-w-0 px-4 sm:border-stroke-soft-200 sm:border-x sm:px-5 lg:px-6 dark:sm:border-white/15",
					contentClassName,
				)}
			>
				{children}
			</div>

			{/* Right gutter */}
			<HatchCell className="border-l" />
		</div>
	);
}
