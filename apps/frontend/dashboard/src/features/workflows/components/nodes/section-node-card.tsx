"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Handle, Position, useEdges, useNodeId } from "@xyflow/react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { nodeTone, type WorkflowNodeTone } from "../../node-tone";
import { useNodeEditor } from "../node-editor-context";
import { StepPickerMenu } from "../step-picker-menu";

export interface SectionSourceHandle {
	id?: string;
	/** Percentage from the left of the card, e.g. "28%". */
	left?: string;
	label?: string;
	labelClassName?: string;
}

interface SectionNodeCardProps {
	nodeId?: string;
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
	"!h-3.5 !w-3.5 !border-2 !border-white dark:!border-[#141419] !bg-stroke-sub-300 dark:!bg-white/40 shadow-xs cursor-crosshair transition-all duration-150 z-30 hover:scale-125 hover:!bg-blue-500 hover:!border-white after:absolute after:-inset-2 after:content-['']";

function SourceHandleConnector({
	nodeId,
	handleId,
	left,
}: {
	nodeId: string;
	handleId?: string;
	left?: string;
}) {
	const [pickerOpen, setPickerOpen] = useState(false);
	const pickerRef = useRef<HTMLDivElement>(null);
	const { addStepBelow } = useNodeEditor();

	useEffect(() => {
		if (!pickerOpen) return;
		const onPointerDown = (e: PointerEvent) => {
			if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
				setPickerOpen(false);
			}
		};
		document.addEventListener("pointerdown", onPointerDown);
		return () => document.removeEventListener("pointerdown", onPointerDown);
	}, [pickerOpen]);

	return (
		<div
			ref={pickerRef}
			className={cn(
				"pointer-events-none absolute top-full flex flex-col items-center",
				pickerOpen ? "z-50" : "z-20",
			)}
			style={{
				left: left ?? "50%",
				transform: "translateX(-50%)",
			}}
		>
			{/* Vertical connector line dropping down from the card handle */}
			<div
				aria-hidden="true"
				className={cn(
					"pointer-events-none mt-1 w-[1.5px] bg-stroke-sub-300 transition-all duration-150 dark:bg-white/20",
					pickerOpen ? "h-4" : "h-6",
				)}
			/>
			{!pickerOpen ? (
				/* Circular plus button */
				<button
					type="button"
					aria-label="Add step here"
					onClick={(e) => {
						e.stopPropagation();
						setPickerOpen(true);
					}}
					className="nodrag nopan group pointer-events-auto flex h-7 w-7 items-center justify-center rounded-full border border-black/10 bg-[#3d444d] text-white shadow-[0_2px_8px_rgba(0,0,0,0.2)] transition-all duration-150 hover:scale-110 hover:bg-[#4d555e] active:scale-95"
				>
					<Icon
						name="plus"
						className="h-4 w-4 transition-transform duration-150 group-hover:rotate-90"
					/>
				</button>
			) : (
				/* Converted: The plus converts directly into the whole node! */
				<div className="nodrag nopan pointer-events-auto">
					<StepPickerMenu
						onPick={(kind) => {
							addStepBelow?.(nodeId, handleId, kind);
							setPickerOpen(false);
						}}
						onClose={() => setPickerOpen(false)}
					/>
				</div>
			)}
		</div>
	);
}

/**
 * Section-style canvas card (Schedule / Triggers / … in the reference design):
 * outer panel with a collapsible header row and an inset body that holds the
 * node's inputs directly. Editing happens inline — there is no side panel.
 */
export const SectionNodeCard = ({
	nodeId,
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
	const fallbackNodeId = useNodeId();
	const activeNodeId = nodeId ?? fallbackNodeId;
	const edges = useEdges();
	const { readOnly } = useNodeEditor();

	return (
		<div
			className={cn(
				"nowheel relative w-[420px] overflow-visible rounded-[14px] border bg-bg-weak-50/60 p-0.5 transition-colors duration-150 ease-out dark:border-stroke-soft-100/40 dark:bg-[#101014]",
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

			<div className="flex cursor-grab items-center gap-2 px-2.5 py-2 active:cursor-grabbing">
				<span
					className={cn(
						"flex h-6 w-6 shrink-0 items-center justify-center rounded-md border",
						meta.iconBorder,
						meta.well,
					)}
				>
					<Icon
						name={meta.icon}
						className={cn("h-3.5 w-3.5", meta.iconClass)}
					/>
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
				{onDelete && !readOnly ? (
					<button
						type="button"
						onClick={onDelete}
						aria-label={`Delete ${meta.label} step`}
						className="nodrag nopan flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-text-soft-400 transition-colors hover:bg-error-lighter hover:text-error-base"
					>
						<Icon name="trash" className="h-3.5 w-3.5" />
					</button>
				) : null}
			</div>

			<div
				onPointerDown={(e) => e.stopPropagation()}
				className={cn(
					"nodrag nopan nowheel cursor-default rounded-xl border border-stroke-soft-100 bg-bg-white-0 p-3 dark:border-stroke-soft-100/40 dark:bg-[#141419]",
					readOnly && "pointer-events-none select-none opacity-80",
				)}
			>
				{children}
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

			{activeNodeId && !readOnly
				? handles.map((handle) => {
						const isConnected = edges.some(
							(e) =>
								e.source === activeNodeId &&
								(e.sourceHandle ?? null) === (handle.id ?? null),
						);
						if (isConnected) return null;
						return (
							<SourceHandleConnector
								key={`connector-${handle.id ?? "source"}`}
								nodeId={activeNodeId}
								handleId={handle.id}
								left={handle.left}
							/>
						);
					})
				: null}

			{labeled
				? handles.map((handle) =>
						handle.label ? (
							<span
								key={`${handle.id}-label`}
								className={cn(
									"-translate-x-1/2 pointer-events-none absolute bottom-0.5 font-mono text-[10px] text-text-sub-600",
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
