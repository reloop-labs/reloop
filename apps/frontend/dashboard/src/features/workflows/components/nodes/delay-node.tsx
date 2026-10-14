"use client";

import type { NodeProps } from "@xyflow/react";
import { formatDelayAmount } from "../../delay-format";
import type { DelayNodeData, WorkflowNode } from "../../workflow-types";
import { getNodeIssue } from "../../workflow-validation";
import { DelayEditor } from "../editors/delay-editor";
import { useNodeEditor } from "../node-editor-context";
import {
	DanglingStub,
	EditSwap,
	NodePill,
	SourceHandle,
	TargetHandle,
	usePrevious,
} from "./flow-node-parts";

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
	const { readOnly } = useNodeEditor();
	const issue = getNodeIssue({ type, data });
	const amount = formatDelayAmount(Number(data.amount), data.unit);
	const editing = selected && !readOnly;
	const wasEditing = usePrevious(editing);

	return (
		<div className="relative">
			<TargetHandle />
			<EditSwap
				editing={editing}
				editor={<DelayEditor nodeId={id} data={data} />}
				rest={
					<NodePill
						removable
						titleExiting={wasEditing}
						title="Delay"
						icon="clock"
						label={amount || null}
						placeholder="Set a wait time"
						ready={!issue}
					/>
				}
			/>
			<SourceHandle hidden={editing} />
			{editing ? null : <DanglingStub nodeId={id} />}
		</div>
	);
};
