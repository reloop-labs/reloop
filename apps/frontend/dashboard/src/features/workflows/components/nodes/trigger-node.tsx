"use client";

import type { NodeProps } from "@xyflow/react";
import type { TriggerNodeData, WorkflowNode } from "../../workflow-types";
import { getNodeIssue } from "../../workflow-validation";
import { useNodeEditor } from "../node-editor-context";
import { TriggerConfigForm } from "../trigger-config-form";
import { SectionNodeCard } from "./section-node-card";

type TriggerFlowNode = WorkflowNode & {
	type: "trigger";
	data: TriggerNodeData;
};

export const TriggerNode = ({
	data,
	id,
	selected,
	type,
}: NodeProps<TriggerFlowNode>) => {
	const { updateNode } = useNodeEditor();
	const issue = getNodeIssue({ type, data });

	return (
		<SectionNodeCard
			nodeId={id}
			tone="trigger"
			badge={issue ? "Setup" : null}
			badgeTone="warning"
			selected={selected}
			hasSource
		>
			<TriggerConfigForm
				value={
					(typeof data.eventKey === "string" && data.eventKey) ||
					(typeof data.eventId === "string" ? data.eventId : undefined)
				}
				onChange={(eventKey, metaEvent) =>
					updateNode(id, {
						...data,
						eventKey,
						eventId: metaEvent?.eventId ?? eventKey,
						eventName: metaEvent?.name,
					})
				}
			/>
		</SectionNodeCard>
	);
};
