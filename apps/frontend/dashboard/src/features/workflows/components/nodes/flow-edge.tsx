"use client";

import {
	BaseEdge,
	EdgeLabelRenderer,
	type EdgeProps,
	getSmoothStepPath,
	Position,
} from "@xyflow/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { useNodeEditor } from "../node-editor-context";
import { StepPickerMenu } from "../step-picker-menu";

export type EdgeTone = "accent" | "default";

const TONE_COLOR: Record<EdgeTone, string> = {
	accent: "var(--color-green-600)",
	default: "var(--color-stroke-sub-300)",
};

export const FlowEdge = ({
	id,
	sourceX,
	sourceY,
	targetX,
	targetY,
	sourcePosition,
	targetPosition,
	markerEnd,
	data,
}: EdgeProps) => {
	const tone: EdgeTone = data?.tone === "accent" ? "accent" : "default";
	const color = TONE_COLOR[tone];
	const isStub = data?.stub === true;

	const [path, labelX, labelY] = getSmoothStepPath({
		sourceX,
		sourceY,
		sourcePosition: sourcePosition ?? Position.Bottom,
		targetX,
		targetY,
		targetPosition: targetPosition ?? Position.Top,
		borderRadius: 12,
	});

	const branch =
		data?.branch === "yes" || data?.branch === "no" ? data.branch : undefined;

	const [pickerOpen, setPickerOpen] = useState(false);
	const pickerRef = useRef<HTMLDivElement>(null);
	const { insertStep } = useNodeEditor();

	useEffect(() => {
		if (!pickerOpen) return;
		const onPointerDown = (e: PointerEvent) => {
			if (
				pickerRef.current &&
				!pickerRef.current.contains(e.target as Node)
			) {
				setPickerOpen(false);
			}
		};
		document.addEventListener("pointerdown", onPointerDown);
		return () => document.removeEventListener("pointerdown", onPointerDown);
	}, [pickerOpen]);

	return (
		<>
			<BaseEdge
				path={path}
				markerEnd={markerEnd}
				style={{ stroke: color, strokeWidth: 1.5 }}
			/>
			{isStub ? null : (
				<EdgeLabelRenderer>
					<div
						ref={pickerRef}
						className="nodrag nopan absolute"
						style={{
							transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
							pointerEvents: "all",
						}}
					>
						<button
							type="button"
							aria-label={pickerOpen ? "Close step picker" : "Insert step here"}
							onClick={() => setPickerOpen((o) => !o)}
							className={cn(
								"flex h-6 w-6 items-center justify-center rounded-full border shadow-regular-sm transition-all duration-150",
								pickerOpen
									? "border-blue-500 bg-blue-500 text-white dark:border-blue-400 dark:bg-blue-500"
									: "border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 hover:border-blue-500 hover:text-blue-600 dark:border-stroke-soft-100/50 dark:bg-[#141419] dark:hover:border-blue-400 dark:hover:text-blue-300",
							)}
						>
							<Icon
								name="plus"
								className={cn(
									"h-3.5 w-3.5 transition-transform duration-150",
									pickerOpen && "rotate-45",
								)}
							/>
						</button>
						{pickerOpen ? (
							<StepPickerMenu
								onPick={(kind) => {
									insertStep(id, kind);
									setPickerOpen(false);
								}}
							/>
						) : null}
					</div>
					{branch ? (
						<div
							className="nodrag nopan pointer-events-none absolute rounded-full border border-stroke-soft-100 bg-bg-white-0 px-1.5 py-0.5 font-mono text-[10px] text-text-sub-600 dark:border-stroke-soft-100/50"
							style={{
								transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY - 30}px)`,
							}}
						>
							{branch === "yes" ? "Yes" : "No"}
						</div>
					) : null}
				</EdgeLabelRenderer>
			)}
		</>
	);
};
