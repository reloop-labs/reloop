import React from "react";

export function Row({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="mt-1.5 flex items-center justify-between gap-2 first:mt-0">
			<span className="shrink-0 text-(--re-text-muted)">{label}</span>
			{children}
		</div>
	);
}
