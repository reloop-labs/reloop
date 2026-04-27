import { cn } from "@reloop/ui/cn";
import type * as React from "react";

export function KbdEsc({
	className,
	...rest
}: React.HTMLAttributes<HTMLSpanElement>) {
	return (
		<span
			className={cn(
				"flex h-[19px] w-7 items-center justify-center rounded-[5px] border border-stroke-soft-100 bg-bg-weak-50/50 p-px font-medium text-[10px]",
				className,
			)}
			{...rest}
		>
			Esc
		</span>
	);
}
