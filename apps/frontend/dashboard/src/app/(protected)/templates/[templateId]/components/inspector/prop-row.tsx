import type React from "react";

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
		<div className="flex items-center gap-3 px-4 py-1">
			<span className="w-1/3 shrink-0 text-sm">{label}</span>
			<div className="flex w-2/3 min-w-0 items-center justify-end">
				{children}
			</div>
		</div>
	);
}
