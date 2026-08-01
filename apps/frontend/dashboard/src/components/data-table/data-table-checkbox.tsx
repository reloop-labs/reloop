"use client";

/**
 * Compact table checkbox styled like tablecn / Dice UI select column.
 * Black checked state; keeps `@reloop/ui/checkbox` unchanged elsewhere.
 */

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { cn } from "@reloop/ui/cn";
import { Check, Minus } from "lucide-react";
import type * as React from "react";

export function DataTableCheckbox({
	className,
	checked,
	...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
	return (
		<CheckboxPrimitive.Root
			checked={checked}
			className={cn(
				"peer relative flex size-4 shrink-0 items-center justify-center rounded-sm border border-stroke-soft-200 bg-bg-white-0 outline-none transition-colors",
				"focus-visible:ring-2 focus-visible:ring-bg-strong-950/30",
				"disabled:cursor-not-allowed disabled:opacity-50",
				"data-[state=checked]:border-bg-strong-950 data-[state=checked]:bg-bg-strong-950 data-[state=checked]:text-static-white",
				"data-[state=indeterminate]:border-bg-strong-950 data-[state=indeterminate]:bg-bg-strong-950 data-[state=indeterminate]:text-static-white",
				"dark:border-stroke-soft-100/50 dark:bg-bg-white-0/5",
				className,
			)}
			{...props}
		>
			<CheckboxPrimitive.Indicator className="grid place-content-center text-current">
				{checked === "indeterminate" ? (
					<Minus className="size-3" strokeWidth={3} />
				) : (
					<Check className="size-3" strokeWidth={3} />
				)}
			</CheckboxPrimitive.Indicator>
		</CheckboxPrimitive.Root>
	);
}
