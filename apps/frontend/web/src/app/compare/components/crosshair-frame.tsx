import { cn } from "@reloop/ui/cn";
import type React from "react";

/**
 * Dashed crosshair frame from the Add Contacts create flow.
 * Decorative only — wraps a focused product panel.
 */
export function CrosshairFrame({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div className={cn("relative", className)}>
			{/* Vertical dashed guides only (desktop) — no full-bleed x-axis lines (overflow). */}
			<div className="pointer-events-none absolute inset-0 z-10 hidden overflow-hidden sm:block">
				<div className="-bottom-[40vh] absolute top-0 left-0 border-stroke-soft-200 border-r border-dashed dark:border-white/10" />
				<div className="-bottom-[40vh] absolute top-0 right-0 border-stroke-soft-200 border-r border-dashed dark:border-white/10" />

				{/* Corner markers */}
				<div className="-translate-x-1/2 -translate-y-1/2 absolute top-0 left-0 z-20 size-2 rounded-[1px] border border-stroke-soft-300 bg-bg-white-0 dark:border-white/20 dark:bg-black" />
				<div className="-translate-y-1/2 absolute top-0 right-0 z-20 size-2 translate-x-1/2 rounded-[1px] border border-stroke-soft-300 bg-bg-white-0 dark:border-white/20 dark:bg-black" />
				<div className="-translate-x-1/2 absolute bottom-0 left-0 z-20 size-2 translate-y-1/2 rounded-[1px] border border-stroke-soft-300 bg-bg-white-0 dark:border-white/20 dark:bg-black" />
				<div className="absolute right-0 bottom-0 z-20 size-2 translate-x-1/2 translate-y-1/2 rounded-[1px] border border-stroke-soft-300 bg-bg-white-0 dark:border-white/20 dark:bg-black" />
			</div>

			<div className="relative z-20 p-3 sm:p-5">{children}</div>
		</div>
	);
}
