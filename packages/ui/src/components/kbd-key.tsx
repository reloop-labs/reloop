import { cn } from "@reloop/ui/cn";
import { EnterIcon } from "@reloop/ui/enter-icon";
import type * as React from "react";

export function KbdKey({
	className,
	children,
	...rest
}: React.HTMLAttributes<HTMLSpanElement>) {
	return (
		<span
			className={cn(
				"flex h-4 w-4 items-center justify-center rounded-sm border border-stroke-soft-100/20 p-px font-medium text-[10px] uppercase",
				className,
			)}
			{...rest}
		>
			{/* A "↵" keycap draws the Enter icon instead of the text glyph. */}
			{children === "↵" ? <EnterIcon /> : children}
		</span>
	);
}
