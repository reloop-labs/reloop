"use client";

import type { NodeProps } from "@xyflow/react";
import type { DelayNodeData, WorkflowNode } from "../../workflow-types";
import { getNodeIssue } from "../../workflow-validation";
import { DelayConfigForm } from "../delay-config-form";
import { useNodeEditor } from "../node-editor-context";
import { SectionNodeCard } from "./section-node-card";

type DelayFlowNode = WorkflowNode & {
	type: "delay";
	data: DelayNodeData;
};

export const DelayNode = ({
	data,
	id,
	selected,
	type,
}: NodeProps<DelayFlowNode>) => {
	const { updateNode, deleteNode } = useNodeEditor();
	const issue = getNodeIssue({ type, data });

	return (
		<SectionNodeCard
			nodeId={id}
			tone="delay"
			badge={issue ? "Setup" : null}
			badgeTone="warning"
			selected={selected}
			hasTarget
			hasSource
			onDelete={() => deleteNode(id)}
		>
			<DelayConfigForm
				value={data}
				idPrefix={`${id}-`}
				onChange={(next) => updateNode(id, next)}
			/>
		</SectionNodeCard>
	);
};
