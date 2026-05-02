import type { LucideIcon } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Card-style section header with optional icon                         */
/* ------------------------------------------------------------------ */
export function SectionHeader({
	label,
	icon: Icon,
}: {
	label: string;
	icon?: LucideIcon;
}) {
	return (
		<div className="flex w-full items-center gap-2 px-4 py-3">
			{Icon && (
				<Icon className="h-3.5 w-3.5 shrink-0 text-text-sub-600" strokeWidth={2} />
			)}
			<span className="text-xs font-semibold uppercase tracking-wider text-text-sub-600">
				{label}
			</span>
		</div>
	);
}
