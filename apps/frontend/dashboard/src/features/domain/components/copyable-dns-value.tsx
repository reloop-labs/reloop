"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as React from "react";

export const CopyableDnsValue = React.forwardRef<
	HTMLButtonElement,
	{
		value: string;
		copied: boolean;
		onCopy: () => void;
		mono?: boolean;
		className?: string;
	}
>(function CopyableDnsValue(
	{ value, copied, onCopy, mono = false, className },
	ref,
) {
	return (
		<button
			ref={ref}
			type="button"
			onClick={onCopy}
			aria-label={copied ? "Copied" : `Copy ${value}`}
			className={cn(
				"group/copy flex min-w-0 max-w-full cursor-pointer items-center gap-1.5 overflow-hidden rounded-md px-1.5 py-0.5 text-left outline-none transition-colors duration-150 ease-out",
				"focus-visible:outline-none focus-visible:ring-0",
				copied ? "bg-success-lighter/10" : "hover:bg-bg-weak-50/80",
				className,
			)}
		>
			<span
				className={cn(
					"min-w-0 flex-1 truncate text-label-sm transition-colors duration-150 ease-out",
					mono ? "font-mono" : "font-medium",
					copied
						? "text-success-dark"
						: mono
							? "text-text-sub-600"
							: "text-text-strong-950",
				)}
			>
				{value}
			</span>
			{/* Fixed-size slot so copy↔check never shifts the value text */}
			<span className="relative h-3.5 w-3.5 shrink-0" aria-hidden>
				<Icon
					name="copy"
					className={cn(
						"absolute inset-0 h-3.5 w-3.5 transition-opacity duration-150 ease-out",
						copied
							? "opacity-0"
							: "text-text-sub-600/50 opacity-100 group-hover/copy:text-text-strong-950",
					)}
				/>
				<Icon
					name="check"
					className={cn(
						"absolute inset-0 h-3.5 w-3.5 text-success-base transition-opacity duration-150 ease-out",
						copied ? "opacity-100" : "opacity-0",
					)}
				/>
			</span>
		</button>
	);
});
