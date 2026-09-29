"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Handle, Position } from "@xyflow/react";
import { type ReactNode, useState } from "react";
import { nodeTone, type WorkflowNodeTone } from "../../node-tone";

export interface SectionSourceHandle {
	id?: string;
	/** Percentage from the left of the card, e.g. "28%". */
	left?: string;
	label?: string;
	labelClassName?: string;
}

interface SectionNodeCardProps {
	tone: WorkflowNodeTone;
	/** Amber pill (setup needed) or blue pill (ready), echoed from the reference design. */
	badge?: string | null;
	badgeTone?: "info" | "warning";
	selected?: boolean;
	hasTarget?: boolean;
	hasSource?: boolean;
	sourceHandles?: SectionSourceHandle[];
	onDelete?: () => void;
	children: ReactNode;
	className?: string;
}

const defaultHandleClass =
	"!h-2 !w-2 !border-2 !bg-stroke-sub-300 transition-[background-color,box-shadow] duration-150";

/**
 * Section-style canvas card (Schedule / Triggers / … in the reference design):
 * outer panel with a collapsible header row and an inset body that holds the
 * node's inputs directly. Editing happens inline — there is no side panel.
 */
export const SectionNodeCard = ({
	tone,
	badge,
	badgeTone = "info",
	selected = false,
	hasTarget = false,
	hasSource = false,
	sourceHandles,
	onDelete,
	children,
	className,
}: SectionNodeCardProps) => {
	const meta = nodeTone[tone];
	const handles = sourceHandles ?? (hasSource ? [{}] : []);
	const labeled = handles.some((h) => h.label);
	const [collapsed, setCollapsed] = useState(false);

	return (
		<div
			className={cn(
				"relative w-[320px] overflow-visible rounded-2xl border bg-bg-white-0 p-1 shadow-[0_1px_2px_rgba(15,23,42,0.06)] transition-[border-color,box-shadow] duration-150 ease-out dark:border-stroke-soft-100/40 dark:bg-[#141419] dark:shadow-[0_1px_2px_rgba(0,0,0,0.4)]",
				selected
					? meta.selected
					: "border-stroke-soft-200 dark:border-stroke-soft-100/40",
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

			<div className="flex items-center gap-2 px-2 py-2">
				<span
					className={cn(
						"flex h-6 w-6 shrink-0 items-center justify-center rounded-md border bg-transparent",
						meta.iconBorder,
					)}
				>
					<Icon name={meta.icon} className={cn("h-3.5 w-3.5", meta.iconClass)} />
				</span>
				<p className="min-w-0 flex-1 truncate font-medium text-[14px] text-text-strong-950">
					{meta.label}
				</p>
				{badge ? (
					<span
						className={cn(
							"flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 font-medium text-[11px]",
							badgeTone === "warning"
								? "border-warning-base/30 bg-warning-lighter/60 text-warning-base"
								: "border-blue-500/25 bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300",
						)}
					>
						{badgeTone === "warning" ? (
							<Icon name="alert-triangle" className="h-3 w-3" />
						) : null}
						{badge}
					</span>
				) : null}
				{onDelete ? (
					<button
						type="button"
						onClick={onDelete}
						aria-label={`Delete ${meta.label} step`}
						className="nodrag nopan flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-text-soft-400 transition-colors hover:bg-error-lighter hover:text-error-base"
					>
						<Icon name="trash" className="h-3.5 w-3.5" />
					</button>
				) : null}
				<button
					type="button"
					onClick={() => setCollapsed((c) => !c)}
					aria-label={collapsed ? "Expand section" : "Collapse section"}
					className="nodrag nopan flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-text-soft-400 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:hover:bg-white/10"
				>
					<Icon
						name="chevron-down"
						className={cn(
							"h-4 w-4 transition-transform duration-150",
							collapsed && "-rotate-90",
						)}
					/>
				</button>
			</div>

			{collapsed ? null : (
				<div className="nodrag nopan mt-1 rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 p-3 dark:border-stroke-soft-100/70 dark:bg-black/40">
					{children}
				</div>
			)}

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
									"pointer-events-none absolute bottom-0.5 -translate-x-1/2 font-mono text-[10px] text-text-sub-600",
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
