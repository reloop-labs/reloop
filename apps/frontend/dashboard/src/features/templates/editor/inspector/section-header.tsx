import type React from "react";

export function SectionHeader({
	label,
	action,
}: {
	label: string;
	action?: React.ReactNode;
}) {
	if (action) {
		return (
			<div className="flex items-center justify-between px-4 pt-3 pb-1">
				<p className="font-semibold text-sm text-text-strong-950">{label}</p>
				{action}
			</div>
		);
	}
	return (
		<p className="px-4 pt-3 pb-1 font-semibold text-sm text-text-strong-950">
			{label}
		</p>
	);
}
