"use client";

import type { NodeProps } from "@xyflow/react";
import type { TriggerNodeData, WorkflowNode } from "../../workflow-types";
import { getNodeIssue } from "../../workflow-validation";
import { FlowNodeCard } from "./flow-node-card";

type TriggerFlowNode = WorkflowNode & {
	type: "trigger";
	data: TriggerNodeData;
};

export const TriggerNode = ({
	data,
	selected,
	type,
}: NodeProps<TriggerFlowNode>) => {
	const title =
		data.eventName ||
		data.eventKey ||
		(typeof data.eventId === "string" ? data.eventId : undefined) ||
		"Select event";
	const subtitle = data.eventName && data.eventKey ? data.eventKey : undefined;
	const issue = getNodeIssue({ type, data });

	return (
		<FlowNodeCard
			tone="trigger"
			title={title}
			subtitle={subtitle}
			issue={issue}
			selected={selected}
			hasSource
		/>
	);
};
