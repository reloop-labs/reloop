// AlignUI Kbd v0.0.0

import { cn } from "@reloop/ui/cn";
import type * as React from "react";

function Kbd({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn(
				"flex h-[18px] items-center gap-0.5 whitespace-nowrap rounded bg-bg-white-0 px-1.5 text-subheading-xs text-text-soft-400 ring-1 ring-stroke-soft-200 ring-inset",
				className,
			)}
			{...rest}
		/>
	);
}

export { Kbd as Root };
