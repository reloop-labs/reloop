import type { LucideIcon } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Icon-based format toggle button (Bold, Italic, Underline, Strike)   */
/* ------------------------------------------------------------------ */
export function MarkButton({
	icon: Icon,
	label,
	active,
	onClick,
}: {
	icon: LucideIcon;
	label: string;
	active: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			title={label}
			aria-label={label}
			aria-pressed={active}
			className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border transition-all duration-150 ${
				active
					? "border-stroke-soft-200 bg-bg-strong-950 text-white shadow-regular-xs"
					: "border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950"
			}`}
		>
			<Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
		</button>
	);
}
