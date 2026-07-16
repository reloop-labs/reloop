"use client";

import { WEBHOOK_EVENTS_BY_ID } from "@reloop/webhook-events";
import type { NodeProps } from "@xyflow/react";
import type { TriggerNodeData, WorkflowNode } from "../../workflow-types";
import { FlowNodeCard } from "./flow-node-card";

type TriggerFlowNode = WorkflowNode & {
	type: "trigger";
	data: TriggerNodeData;
};

export const TriggerNode = ({ data, selected }: NodeProps<TriggerFlowNode>) => {
	const event = data.eventId
		? WEBHOOK_EVENTS_BY_ID.get(data.eventId)
		: undefined;

	return (
		<FlowNodeCard
			category={data.category ?? "Trigger · Event"}
			title={event?.name ?? "Select event"}
			icon="route"
			selected={selected}
			hasSource
		/>
	);
};
