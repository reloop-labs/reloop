"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Handle, Position } from "@xyflow/react";
import type { ReactNode } from "react";
import { nodeTone, type WorkflowNodeTone } from "../../node-tone";

export interface FlowSourceHandle {
	id?: string;
	/** Percentage from the left of the card, e.g. "28%". */
	left?: string;
	label?: string;
	labelClassName?: string;
}

interface FlowNodeCardProps {
	tone: WorkflowNodeTone;
	/** Bold title shown in the body. */
	title: string;
	/** Optional second line under the title. */
	subtitle?: string;
	/** Incomplete / needs-setup copy. */
	issue?: string | null;
	selected?: boolean;
	hasTarget?: boolean;
	hasSource?: boolean;
	sourceHandles?: FlowSourceHandle[];
	trailing?: ReactNode;
	className?: string;
}

const defaultHandleClass =
	"!h-2.5 !w-2.5 !border-2 !bg-stroke-sub-300 transition-[background-color,box-shadow] duration-150";

export const FlowNodeCard = ({
	tone,
	title,
	subtitle,
	issue,
	selected = false,
	hasTarget = false,
	hasSource = false,
	sourceHandles,
	trailing,
	className,
}: FlowNodeCardProps) => {
	const meta = nodeTone[tone];
	const handles = sourceHandles ?? (hasSource ? [{}] : []);
	const labeled = handles.some((h) => h.label);

	return (
		<div
			className={cn(
				"relative w-[280px] overflow-visible rounded-2xl border bg-bg-white-0 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-[border-color,box-shadow] duration-150 ease-out dark:bg-bg-white-0/5",
				selected
					? meta.selected
					: "border-stroke-soft-200 dark:border-stroke-soft-100/60",
				className,
			)}
		>
			{hasTarget ? (
				<Handle
					type="target"
					position={Position.Top}
					className={cn(defaultHandleClass, selected && meta.handleClass)}
				/>
			) : null}

			<div className={cn("overflow-hidden rounded-2xl", labeled && "pb-4")}>
				<div className="flex items-center gap-3 px-3.5 py-3">
					<div
						className={cn(
							"flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
							meta.well,
						)}
					>
						<Icon name={meta.icon} className="h-4 w-4" />
					</div>
					<div className="min-w-0 flex-1">
						<p className="font-mono text-[10px] text-text-soft-400 uppercase tracking-[0.12em]">
							{meta.label}
						</p>
						<p className="truncate font-semibold text-[14px] text-text-strong-950 leading-tight">
							{title}
						</p>
						{subtitle ? (
							<p className="mt-0.5 truncate font-mono text-[11px] text-text-sub-600">
								{subtitle}
							</p>
						) : null}
					</div>
					{trailing ? (
						<span className="shrink-0 text-text-soft-400">{trailing}</span>
					) : null}
				</div>
				{issue ? (
					<div className="flex items-center gap-1.5 border-stroke-soft-100 border-t bg-warning-lighter/50 px-3.5 py-1.5 dark:border-stroke-soft-100/50">
						<span className="h-1.5 w-1.5 shrink-0 rounded-full bg-warning-base" />
						<p className="truncate text-[11px] text-warning-base">{issue}</p>
					</div>
				) : null}
			</div>

			{handles.map((handle) => (
				<Handle
					key={handle.id ?? "source"}
					type="source"
					id={handle.id}
					position={Position.Bottom}
					className={cn(defaultHandleClass, selected && meta.handleClass)}
					style={handle.left ? { left: handle.left } : undefined}
				/>
			))}

			{labeled
				? handles.map((handle) =>
						handle.label ? (
							<span
								key={`${handle.id}-label`}
								className={cn(
									"pointer-events-none absolute bottom-1 -translate-x-1/2 font-mono text-[10px] text-text-sub-600",
									handle.labelClassName,
								)}
								style={{ left: handle.left }}
							>
								{handle.label}
							</span>
						) : null,
					)
				: null}
		</div>
	);
};
