import type React from "react";

/* ------------------------------------------------------------------ */
/* Property row: label left (flexible), control right (shrink-0)      */
/* ------------------------------------------------------------------ */
export function PropRow({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex h-10 items-center justify-between gap-3 px-4">
			<span className="min-w-0 flex-1 truncate font-normal text-sm text-text-sub-600 dark:text-text-soft-400">
				{label}
			</span>
			<div className="flex shrink-0 items-center justify-end">
				{children}
			</div>
		</div>
	);
}

