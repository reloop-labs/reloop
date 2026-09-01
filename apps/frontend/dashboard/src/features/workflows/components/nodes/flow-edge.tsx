"use client";

import {
	BaseEdge,
	EdgeLabelRenderer,
	type EdgeProps,
	getSmoothStepPath,
	Position,
} from "@xyflow/react";

export type EdgeTone = "accent" | "default";

const TONE_COLOR: Record<EdgeTone, string> = {
	accent: "var(--color-orange-500)",
	default: "var(--color-stroke-sub-300)",
};

export const FlowEdge = ({
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

	return (
		<>
			<BaseEdge
				path={path}
				markerEnd={markerEnd}
				style={{ stroke: color, strokeWidth: 1.5 }}
			/>
			<circle
				cx={sourceX}
				cy={sourceY}
				r={3.5}
				fill={color}
				stroke="var(--color-bg-white-0)"
				strokeWidth={1.5}
			/>
			<circle
				cx={targetX}
				cy={targetY}
				r={3.5}
				fill={color}
				stroke="var(--color-bg-white-0)"
				strokeWidth={1.5}
			/>
			{branch ? (
				<EdgeLabelRenderer>
					<div
						className="nodrag nopan pointer-events-none absolute rounded-full border border-stroke-soft-100 bg-bg-white-0 px-1.5 py-0.5 font-mono text-[10px] text-text-sub-600 dark:border-stroke-soft-100/50"
						style={{
							transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
						}}
					>
						{branch === "yes" ? "Yes" : "No"}
					</div>
				</EdgeLabelRenderer>
			) : null}
		</>
	);
};
