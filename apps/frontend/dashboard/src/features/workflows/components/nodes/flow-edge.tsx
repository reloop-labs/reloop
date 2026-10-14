"use client";

import { cn } from "@reloop/ui/cn";
import {
	BaseEdge,
	EdgeLabelRenderer,
	type EdgeProps,
	getSmoothStepPath,
	Position,
} from "@xyflow/react";
import { BRANCH_SPLIT_DROP } from "../../layout";
import { pickerTargetKey, useNodeEditor } from "../node-editor-context";
import { RotatingPlus } from "./flow-node-parts";

export type EdgeTone = "accent" | "default";

const STROKE = "var(--color-stroke-sub-300)";

export const FlowEdge = ({
	id,
	source,
	target: targetId,
	sourceX,
	sourceY,
	targetX,
	targetY,
	sourcePosition,
	targetPosition,
	data,
}: EdgeProps) => {
	const { openPicker, closePicker, activePickerKey, readOnly } =
		useNodeEditor();

	const [path] = getSmoothStepPath({
		sourceX,
		sourceY,
		sourcePosition: sourcePosition ?? Position.Bottom,
		targetX,
		targetY,
		targetPosition: targetPosition ?? Position.Top,
		borderRadius: 10,
		offset: 0,
		// Branches fork just under the condition, matching the dangling stubs.
		centerY: sourceY + BRANCH_SPLIT_DROP,
	});

	const branch =
		data?.branch === "yes" || data?.branch === "no" ? data.branch : undefined;
	// On the Runs view, a path this run did not take.
	const dimmed = data?.dimmed === true;
	const target = { type: "insert", edgeId: id } as const;
	const active = activePickerKey === pickerTargetKey(target);

	// Every edge ends in a vertical run into the target's top, so the chip
	// sits in the middle of that run.
	const chipX = targetX;
	const chipY =
		targetX === sourceX
			? (sourceY + targetY) / 2
			: (sourceY + BRANCH_SPLIT_DROP + targetY) / 2;

	return (
		<>
			<BaseEdge
				path={path}
				style={{
					stroke: STROKE,
					strokeWidth: 2,
					strokeLinecap: "round",
					opacity: dimmed ? 0.4 : 1,
				}}
			/>
			{/*
			 * Short, chunky arrowhead with a thick round-joined stroke, so every
			 * corner is rounded off (like Cloudflare's connectors). The tip is
			 * pulled back by half the stroke so it just touches the step.
			 */}
			<path
				d={`M ${targetX - 4} ${targetY - 8} L ${targetX} ${targetY - 1.75} L ${targetX + 4} ${targetY - 8} Z`}
				fill={STROKE}
				stroke={STROKE}
				strokeWidth={3}
				strokeLinejoin="round"
				opacity={dimmed ? 0.4 : 1}
			/>
			{/* No "+" next to the open insert placeholder: it's already the menu. */}
			{(readOnly && !branch) ||
			source.startsWith("add_step_") ||
			targetId.startsWith("add_step_") ? null : (
				<EdgeLabelRenderer>
					<div
						className="nodrag nopan absolute"
						style={{
							transform: `translate(-50%, -50%) translate(${chipX}px, ${chipY}px)`,
							pointerEvents: readOnly ? "none" : "all",
							opacity: dimmed ? 0.4 : 1,
						}}
					>
						<button
							type="button"
							aria-label={
								branch
									? `Insert step on ${branch === "yes" ? "Yes" : "No"} path`
									: "Insert step here"
							}
							onClick={(e) => {
								e.stopPropagation();
								if (active) closePicker();
								else openPicker(target, e.currentTarget);
							}}
							className={cn(
								"group flex h-6 items-center justify-center gap-1 rounded-[7px] border transition-colors duration-150",
								branch ? "px-1.5" : "w-6",
								active
									? "border-transparent bg-bg-strong-950 text-text-white-0"
									: "border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 hover:border-stroke-sub-300 hover:text-text-strong-950 dark:border-stroke-soft-100/50 dark:bg-[#141419]",
							)}
						>
							{branch ? (
								<span className="font-mono text-[10px] uppercase tracking-wide">
									{branch === "yes" ? "Yes" : "No"}
								</span>
							) : null}
							{readOnly ? null : (
								<RotatingPlus
									open={active}
									className={cn(
										"h-3 w-3",
										branch &&
											!active &&
											"hidden group-hover:block group-focus-visible:block",
									)}
								/>
							)}
						</button>
					</div>
				</EdgeLabelRenderer>
			)}
		</>
	);
};
