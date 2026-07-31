"use client";

import type { NodeProps } from "@xyflow/react";
import type { DelayNodeData, WorkflowNode } from "../../workflow-types";
import { FlowNodeCard } from "./flow-node-card";

type DelayFlowNode = WorkflowNode & {
	type: "delay";
	data: DelayNodeData;
};

function formatDelay(data: DelayNodeData): string {
	const amount = Number(data.amount);
	const unit = data.unit ?? "minutes";
	if (!Number.isFinite(amount)) return "Set delay";
	const label =
		unit === "days" ? "day" : unit === "hours" ? "hour" : "minute";
	const plural = amount === 1 ? label : `${label}s`;
	return `Wait ${amount} ${plural}`;
}

export const DelayNode = ({ data, selected }: NodeProps<DelayFlowNode>) => {
	return (
		<FlowNodeCard
			category={data.category ?? "Wait · Delay"}
			title={formatDelay(data)}
			icon="clock"
			selected={selected}
			hasTarget
			hasSource
		/>
	);
};
