"use client";

import { cn } from "@reloop/ui/cn";
import type React from "react";

// Default → primary-base (#d97757) tint; method items override with semantic color
const DEFAULT_BG = "rgba(217, 119, 87, 0.10)";

// Method → subtle rgba background tint (matches badge semantic colors)
const METHOD_BG: Record<string, string> = {
	GET: "rgba(34, 197, 94, 0.10)",
	POST: "rgba(59, 130, 246, 0.10)",
	DELETE: "rgba(239, 68, 68, 0.10)",
	PATCH: "rgba(249, 115, 22, 0.10)",
	PUT: "rgba(168, 85, 247, 0.10)",
};

interface AnimatedHoverBackgroundProps {
	rect: { width: number; height: number; top: number; left: number } | null;
	className?: string;
	/** When true, disables the CSS transition so the background snaps instantly. */
	skipTransition?: boolean;
	/** HTTP method of the hovered/active item — drives the background tint color. */
	method?: string | null;
}

export const AnimatedHoverBackground: React.FC<
	AnimatedHoverBackgroundProps
> = ({ rect, className, skipTransition, method }) => {
	const bgColor = method ? (METHOD_BG[method] ?? DEFAULT_BG) : DEFAULT_BG;

	return (
		<div
			className={cn(
				"pointer-events-none absolute top-0 left-0 z-0 rounded-lg ease-out",
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
				backgroundColor: bgColor,
			}}
		/>
	);
};
