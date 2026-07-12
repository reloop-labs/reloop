"use client";

import {
	BaseEdge,
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

	const [path] = getSmoothStepPath({
		sourceX,
		sourceY,
		sourcePosition: sourcePosition ?? Position.Bottom,
		targetX,
		targetY,
		targetPosition: targetPosition ?? Position.Top,
		borderRadius: 12,
	});

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
		</>
	);
};
