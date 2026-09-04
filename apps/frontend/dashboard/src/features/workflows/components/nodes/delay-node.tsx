"use client";

import type { NodeProps } from "@xyflow/react";
import type { DelayNodeData, WorkflowNode } from "../../workflow-types";
import { getNodeIssue } from "../../workflow-validation";
import { FlowNodeCard } from "./flow-node-card";

type DelayFlowNode = WorkflowNode & {
	type: "delay";
	data: DelayNodeData;
};

function formatDelay(data: DelayNodeData): string {
	const amount = Number(data.amount);
	const unit = data.unit ?? "minutes";
	if (!Number.isFinite(amount)) return "Set delay";
	const label = unit === "days" ? "day" : unit === "hours" ? "hour" : "minute";
	const plural = amount === 1 ? label : `${label}s`;
	return `Wait ${amount} ${plural}`;
}

export const DelayNode = ({
	data,
	selected,
	type,
}: NodeProps<DelayFlowNode>) => {
	const issue = getNodeIssue({ type, data });

	return (
		<FlowNodeCard
			tone="delay"
			title={formatDelay(data)}
			issue={issue}
			selected={selected}
			hasTarget
			hasSource
		/>
	);
};
