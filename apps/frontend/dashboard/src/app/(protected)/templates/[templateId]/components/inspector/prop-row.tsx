import React from "react";

/* ------------------------------------------------------------------ */
/* Property row: label left, control right                             */
/* ------------------------------------------------------------------ */
export function PropRow({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex items-center justify-between gap-3 py-1.5">
			<span className="shrink-0 text-text-sub-600 text-xs">{label}</span>
			<div className="flex min-w-0 flex-1 justify-end">{children}</div>
		</div>
	);
}
