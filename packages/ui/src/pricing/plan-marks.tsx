import { cn } from "@reloop/ui/cn";
import type React from "react";

/** Included mark used by the pricing and compare tables. */
export function PlanCheckmark({ className }: { className?: string }) {
	return (
		<svg
			fill="none"
			height="24"
			viewBox="0 0 20 20"
			width="24"
			xmlns="http://www.w3.org/2000/svg"
			className={cn("text-text-strong-950 dark:text-white", className)}
			style={
				{
					"--color-blue-accent": "currentColor",
				} as React.CSSProperties
			}
			aria-label="Included"
			role="img"
		>
			<circle
				cx="10"
				cy="10"
				fill="var(--color-blue-accent)"
				fillOpacity="0.1"
				r="8"
			/>
			<path
				d="M7 10.5L9 12.5L13 7.5"
				stroke="var(--color-blue-accent)"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1.25"
			/>
		</svg>
	);
}

/** Not-included mark used by the pricing and compare tables. */
export function PlanCrossIcon({ className }: { className?: string }) {
	return (
		<svg
			fill="none"
			height="20"
			viewBox="0 0 20 20"
			width="20"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			aria-label="Not included"
			role="img"
		>
			<path
				d="M7 7L13 13M13 7L7 13"
				stroke="#060606"
				strokeOpacity="0.37"
				strokeWidth="1.25"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="dark:stroke-opacity-30 dark:stroke-white"
			/>
		</svg>
	);
}
