import { BaseEdge, type EdgeProps, getStraightPath } from "@xyflow/react";

export function TimelineFlowEdge({
	id,
	sourceX,
	sourceY,
	targetX,
	targetY,
	style,
	markerEnd,
}: EdgeProps) {
	const [edgePath] = getStraightPath({
		sourceX,
		sourceY,
		targetX,
		targetY,
	});

	return (
		<BaseEdge
			id={id}
			path={edgePath}
			markerEnd={markerEnd}
			style={{
				stroke: "var(--color-stroke-soft-100, #E2E8F0)",
				strokeWidth: 1.5,
				strokeDasharray: "4 4",
				...style,
			}}
		/>
	);
}
