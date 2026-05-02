import React from "react";

/* ------------------------------------------------------------------ */
/* Property row: label left (fixed 80px), control right               */
/* ------------------------------------------------------------------ */
export function PropRow({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex min-h-9 items-center gap-3 px-4 py-1.5">
			<span className="w-20 shrink-0 text-xs font-medium text-text-sub-600">
				{label}
			</span>
			<div className="flex min-w-0 flex-1 items-center justify-end">
				{children}
			</div>
		</div>
	);
}
