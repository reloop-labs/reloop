"use client";

import { cn } from "@reloop/ui/cn";
import type React from "react";

interface AnimatedHoverBackgroundProps {
	rect: { width: number; height: number; top: number; left: number } | null;
	className?: string;
	/** When true, disables the CSS transition so the background snaps instantly. */
	skipTransition?: boolean;
}

export const AnimatedHoverBackground: React.FC<
	AnimatedHoverBackgroundProps
> = ({ rect, className, skipTransition }) => {
	return (
		<div
			className={cn(
				"pointer-events-none absolute top-0 left-0 z-0 rounded-lg bg-neutral-alpha-10 ease-out",
				!skipTransition && "transition-all duration-200",
				className,
			)}
			style={{
				width: rect ? rect.width : 0,
				height: rect ? rect.height : 0,
				transform: rect
					? `translate3d(${rect.left}px, ${rect.top}px, 0)`
					: undefined,
				opacity: rect ? 1 : 0,
				willChange: "transform, opacity",
			}}
		/>
	);
};
