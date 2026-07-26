import { cn } from "@reloop/ui/cn";
import type React from "react";

/**
 * Nested product shell matching the Add Contacts / CopyCodeBlock chrome:
 * soft outer tray + inset white surface.
 */
export function ProductPanel({
	children,
	className,
	innerClassName,
	title,
	description,
	header,
}: {
	children: React.ReactNode;
	className?: string;
	innerClassName?: string;
	title?: string;
	description?: string;
	header?: React.ReactNode;
}) {
	return (
		<div
			className={cn(
				"overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-soft-50 dark:border-white/10 dark:bg-white/[0.03]",
				className,
			)}
		>
			<div
				className={cn(
					"m-0.5 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 dark:border-white/10 dark:bg-black/40",
					innerClassName,
				)}
			>
				{(title || description || header) && (
					<div className="border-stroke-soft-200 border-b px-5 py-4 sm:px-6 dark:border-white/10">
						{header ?? (
							<>
								{title ? (
									<h3 className="font-semibold text-[15px] text-text-strong-950 tracking-tight dark:text-white">
										{title}
									</h3>
								) : null}
								{description ? (
									<p className="mt-1 text-[13px] text-text-sub-600 leading-relaxed dark:text-white/50">
										{description}
									</p>
								) : null}
							</>
						)}
					</div>
				)}
				{children}
			</div>
		</div>
	);
}
