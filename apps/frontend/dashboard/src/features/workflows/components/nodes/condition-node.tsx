"use client";

import type { NodeProps } from "@xyflow/react";
import type { ConditionNodeData, WorkflowNode } from "../../workflow-types";
import { getNodeIssue } from "../../workflow-validation";
import { ConditionConfigForm } from "../condition-config-form";
import { useNodeEditor } from "../node-editor-context";
import { SectionNodeCard } from "./section-node-card";

type ConditionFlowNode = WorkflowNode & {
	type: "condition";
	data: ConditionNodeData;
};

export const ConditionNode = ({
	data,
	id,
	selected,
	type,
}: NodeProps<ConditionFlowNode>) => {
	const { updateNode, deleteNode } = useNodeEditor();
	const issue = getNodeIssue({ type, data });

	return (
		<SectionNodeCard
			tone="condition"
			badge={issue ? "Setup" : null}
			badgeTone="warning"
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
			onDelete={() => deleteNode(id)}
		>
			<ConditionConfigForm
				value={data}
				idPrefix={`${id}-`}
				onChange={(next) => updateNode(id, next)}
			/>
		</SectionNodeCard>
	);
};
