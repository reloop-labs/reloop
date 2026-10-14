"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";

/**
 * Icons for the workflow menus: the regular sprite icons (same as the input),
 * except "+" and "✓", which are redrawn with a heavier stroke so they don't
 * look thin next to the text.
 */
export const StepIcon = ({
	name,
	className,
}: {
	name: string;
	className?: string;
}) => {
	const heavy = name === "plus" || name === "check";
	if (!heavy) {
		return <Icon name={name} className={cn("h-4 w-4 shrink-0", className)} />;
	}
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden
			className={cn("h-4 w-4 shrink-0", className)}
		>
			{name === "plus" ? (
				<path d="M12 5v14M5 12h14" />
			) : (
				<path d="m5 12.5 4.5 4.5L19 7" />
			)}
		</svg>
	);
};
