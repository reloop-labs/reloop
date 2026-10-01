"use client";

import { Icon } from "@reloop/ui/icon";
import {
	BaseEdge,
	EdgeLabelRenderer,
	type EdgeProps,
	getSmoothStepPath,
	Position,
} from "@xyflow/react";
import { useNodeEditor } from "../node-editor-context";

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

	const { insertStep, readOnly } = useNodeEditor();

	return (
		<>
			{isStub ? null : (
				<BaseEdge
					path={path}
					markerEnd={markerEnd}
					style={{ stroke: color, strokeWidth: 1.5 }}
				/>
			)}
			{isStub || readOnly ? null : (
				<EdgeLabelRenderer>
					<div
						className="nodrag nopan absolute z-30"
						style={{
							transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
							pointerEvents: "all",
						}}
					>
						<button
							type="button"
							aria-label="Insert step here"
							onClick={(e) => {
								e.stopPropagation();
								insertStep(id, "add_step");
							}}
							className="group flex h-7 w-7 items-center justify-center rounded-full border border-black/10 bg-[#3d444d] text-white shadow-[0_2px_10px_rgba(0,0,0,0.25)] transition-all duration-150 hover:scale-110 hover:bg-[#4d555e] active:scale-95"
						>
							<Icon
								name="plus"
								className="h-4 w-4 transition-transform duration-150 group-hover:rotate-90"
							/>
						</button>
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
