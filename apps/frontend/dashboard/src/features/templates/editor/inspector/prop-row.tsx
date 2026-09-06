import { RotateCcw } from "lucide-react";
import type React from "react";

/* ------------------------------------------------------------------ */
/* Property row: label left (flexible), control right (shrink-0)      */
/* Optional reset/revert action when property is overridden           */
/* ------------------------------------------------------------------ */
export function PropRow({
	label,
	children,
	onReset,
	isOverridden,
}: {
	label: string;
	children: React.ReactNode;
	onReset?: () => void;
	isOverridden?: boolean;
}) {
	return (
		<div className="group/row flex h-10 items-center justify-between gap-3 px-4">
			<div className="flex min-w-0 flex-1 items-center gap-1.5">
				{isOverridden && (
					<span
						title="Custom style override applied"
						className="size-1.5 shrink-0 rounded-full bg-primary-base"
					/>
				)}
				<span className="truncate font-normal text-sm text-text-sub-600 dark:text-text-soft-400">
					{label}
				</span>
				{onReset && isOverridden && (
					<button
						type="button"
						onClick={onReset}
						title="Revert to inherited default"
						className="opacity-0 transition-opacity group-hover/row:opacity-100 hover:text-text-strong-950 text-text-soft-400 cursor-pointer p-0.5 rounded focus:outline-none"
					>
						<RotateCcw className="size-3 stroke-[2]" />
					</button>
				)}
			</div>
			<div className="flex shrink-0 items-center justify-end">
				{children}
			</div>
		</div>
	);
}
