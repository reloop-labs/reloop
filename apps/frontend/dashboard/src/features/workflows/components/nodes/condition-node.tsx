"use client";

import type { NodeProps } from "@xyflow/react";
import type { ConditionNodeData, WorkflowNode } from "../../workflow-types";
import { getNodeIssue } from "../../workflow-validation";
import { FlowNodeCard } from "./flow-node-card";

type ConditionFlowNode = WorkflowNode & {
	type: "condition";
	data: ConditionNodeData;
};

const OPERATOR_LABEL: Record<string, string> = {
	eq: "=",
	neq: "≠",
	contains: "contains",
	exists: "is set",
	not_exists: "is not set",
	gt: ">",
	lt: "<",
};

function formatCondition(data: ConditionNodeData): string {
	const field = data.field?.trim();
	if (!field) return "Set condition";
	const op = OPERATOR_LABEL[data.operator] ?? data.operator;
	if (data.operator === "exists" || data.operator === "not_exists") {
		return `${field} ${op}`;
	}
	const value = data.value?.trim();
	if (!value) return `${field} ${op} …`;
	return `${field} ${op} ${value}`;
}

export const ConditionNode = ({
	data,
	selected,
	type,
}: NodeProps<ConditionFlowNode>) => {
	const issue = getNodeIssue({ type, data });

	return (
		<FlowNodeCard
			tone="condition"
			title={formatCondition(data)}
			issue={issue}
			selected={selected}
			hasTarget
			sourceHandles={[
				{
					id: "yes",
					left: "28%",
					label: "Yes",
					labelClassName: "text-success-base",
				},
				{
					id: "no",
					left: "72%",
					label: "No",
				},
			]}
		/>
	);
};
