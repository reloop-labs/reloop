"use client";

import type { NodeProps } from "@xyflow/react";
import type { SendEmailNodeData, WorkflowNode } from "../../workflow-types";
import { getNodeIssue } from "../../workflow-validation";
import { useNodeEditor } from "../node-editor-context";
import { SendEmailConfigForm } from "../send-email-config-form";
import { SectionNodeCard } from "./section-node-card";

type SendEmailFlowNode = WorkflowNode & {
	type: "send_email";
	data: SendEmailNodeData;
};

export const SendEmailNode = ({
	data,
	id,
	selected,
	type,
}: NodeProps<SendEmailFlowNode>) => {
	const { updateNode, deleteNode } = useNodeEditor();
	const issue = getNodeIssue({ type, data });

	return (
		<SectionNodeCard
			nodeId={id}
			tone="send_email"
			badge={issue ? "Setup" : null}
			badgeTone="warning"
			selected={selected}
			hasTarget
			hasSource
			onDelete={() => deleteNode(id)}
		>
			<SendEmailConfigForm
				value={data}
				idPrefix={`${id}-`}
				onChange={(next) => updateNode(id, next)}
			/>
		</SectionNodeCard>
	);
};
