import { Loader } from "@dot-loaders/react";
import { cn } from "@reloop/ui/cn";
import type { CSSProperties } from "react";

/** Shared inbox loading indicator — `@dot-loaders` pulse (no circular spinners). */
export function LoadingDot({
	className,
	label = "Loading",
	style,
}: {
	className?: string;
	label?: string;
	style?: CSSProperties;
}) {
	return (
		<Loader
			loader="pulse"
			fallbackLabel={label}
			className={cn("text-current", className)}
			style={style}
		/>
	);
}
