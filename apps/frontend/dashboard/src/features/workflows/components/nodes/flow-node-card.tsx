"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Handle, Position } from "@xyflow/react";
import type { ReactNode } from "react";

interface FlowNodeCardProps {
	/** Monospace category label shown in the header row, e.g. "Data source · Browser Run". */
	category: string;
	/** Bold title shown in the body row. */
	title: string;
	/** Icon sprite name rendered next to the title. */
	icon: string;
	/** Shows the "OPTIONAL" pill on the right of the header row. */
	optional?: boolean;
	/** Highlights the card with the accent ring when selected. */
	selected?: boolean;
	/** Renders a target handle on top of the card. */
	hasTarget?: boolean;
	/** Renders a source handle at the bottom of the card. */
	hasSource?: boolean;
	/** Optional trailing content in the body row (e.g. a muted status). */
	trailing?: ReactNode;
	className?: string;
}

export const FlowNodeCard = ({
	category,
	title,
	icon,
	optional = false,
	selected = false,
	hasTarget = false,
	hasSource = false,
	trailing,
	className,
}: FlowNodeCardProps) => {
	return (
		<div
			className={cn(
				"w-[300px] overflow-hidden rounded-xl border bg-bg-white-0 shadow-regular-sm transition-[box-shadow,border-color] dark:bg-bg-white-0/5",
				selected
					? "border-orange-500 ring-2 ring-orange-500/20"
					: "border-stroke-soft-200 dark:border-stroke-soft-100/60",
				className,
			)}
		>
			{hasTarget ? <Handle type="target" position={Position.Top} /> : null}

			<div className="flex items-center justify-between gap-3 border-stroke-soft-100 border-b px-4 py-2.5">
				<span className="truncate font-mono text-[11px] text-text-soft-400 leading-none tracking-wide">
					{category}
				</span>
				{optional ? (
					<span className="shrink-0 font-mono text-[10px] text-text-soft-400 uppercase leading-none tracking-[0.12em]">
						Optional
					</span>
				) : null}
			</div>

			<div className="flex items-center gap-2.5 px-4 py-3.5">
				<Icon
					name={icon}
					className="h-[18px] w-[18px] shrink-0 text-text-sub-600"
				/>
				<span className="min-w-0 flex-1 truncate font-semibold text-[15px] text-text-strong-950 leading-tight">
					{title}
				</span>
				{trailing ? (
					<span className="shrink-0 text-text-soft-400">{trailing}</span>
				) : null}
			</div>

			{hasSource ? <Handle type="source" position={Position.Bottom} /> : null}
		</div>
	);
};
