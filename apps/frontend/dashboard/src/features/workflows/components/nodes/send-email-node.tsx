"use client";

import type { NodeProps } from "@xyflow/react";
import type { SendEmailNodeData, WorkflowNode } from "../../workflow-types";
import { getNodeIssue } from "../../workflow-validation";
import { FlowNodeCard } from "./flow-node-card";

type SendEmailFlowNode = WorkflowNode & {
	type: "send_email";
	data: SendEmailNodeData;
};

export const SendEmailNode = ({
	data,
	selected,
	type,
}: NodeProps<SendEmailFlowNode>) => {
	const issue = getNodeIssue({ type, data });

	return (
		<FlowNodeCard
			tone="send_email"
			title={data.subject?.trim() || "No subject"}
			subtitle={data.to?.trim() || undefined}
			issue={issue}
			selected={selected}
			hasTarget
			hasSource
		/>
	);
};
