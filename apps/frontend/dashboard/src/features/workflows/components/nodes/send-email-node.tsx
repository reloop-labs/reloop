"use client";

import type { NodeProps } from "@xyflow/react";
import type { SendEmailNodeData, WorkflowNode } from "../../workflow-types";
import { FlowNodeCard } from "./flow-node-card";

type SendEmailFlowNode = WorkflowNode & {
	type: "send_email";
	data: SendEmailNodeData;
};

export const SendEmailNode = ({
	data,
	selected,
}: NodeProps<SendEmailFlowNode>) => {
	return (
		<FlowNodeCard
			category={data.category ?? "Action · Send email"}
			title={data.subject?.trim() || "No subject"}
			icon="mail-single"
			optional={data.optional}
			selected={selected}
			hasTarget
			hasSource
		/>
	);
};
