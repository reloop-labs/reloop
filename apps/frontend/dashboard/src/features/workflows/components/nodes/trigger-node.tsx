"use client";

import type { NodeProps } from "@xyflow/react";
import type { TriggerNodeData, WorkflowNode } from "../../workflow-types";
import { FlowNodeCard } from "./flow-node-card";

type TriggerFlowNode = WorkflowNode & {
	type: "trigger";
	data: TriggerNodeData;
};

export const TriggerNode = ({ data, selected }: NodeProps<TriggerFlowNode>) => {
	const title =
		data.eventName ||
		data.eventKey ||
		(typeof data.eventId === "string" ? data.eventId : undefined) ||
		"Select event";

	return (
		<FlowNodeCard
			category={data.category ?? "Trigger · Workflow event"}
			title={title}
			icon="route"
			selected={selected}
			hasSource
		/>
	);
};
