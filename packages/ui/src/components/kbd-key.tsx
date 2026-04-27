import { cn } from "@reloop/ui/cn";
import type * as React from "react";

export function KbdKey({
	className,
	...rest
}: React.HTMLAttributes<HTMLSpanElement>) {
	return (
		<span
			className={cn(
				"flex h-4 w-4 items-center justify-center rounded-sm border border-stroke-soft-100/20 p-px font-medium text-[10px] uppercase",
				className,
			)}
			{...rest}
		/>
	);
}
