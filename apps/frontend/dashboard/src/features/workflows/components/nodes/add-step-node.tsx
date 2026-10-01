"use client";

import type { NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";
import type { WorkflowNode } from "../../workflow-types";
import { useNodeEditor } from "../node-editor-context";
import { StepPickerMenu } from "../step-picker-menu";

export const AddStepNode = ({ id }: NodeProps<WorkflowNode>) => {
	const { replaceStep, deleteNode, readOnly } = useNodeEditor();

	if (readOnly) return null;

	return (
		<div className="relative">
			<Handle
				type="target"
				position={Position.Top}
				className="!h-0 !w-0 !border-0 !bg-transparent opacity-0"
			/>
			<StepPickerMenu
				onPick={(kind) => {
					if (kind !== "add_step") {
						replaceStep(id, kind);
					}
				}}
				onClose={() => {
					deleteNode(id);
				}}
			/>
			<Handle
				type="source"
				position={Position.Bottom}
				className="!h-0 !w-0 !border-0 !bg-transparent opacity-0"
			/>
		</div>
	);
};
