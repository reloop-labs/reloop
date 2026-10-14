"use client";

import type { NodeProps } from "@xyflow/react";
import type { WorkflowNode } from "../../workflow-types";
import { useNodeEditor } from "../node-editor-context";
import { StepPicker } from "../step-picker";
import { SourceHandle, TargetHandle } from "./flow-node-parts";

/**
 * Temporary step that holds the "Add a step" menu when inserting between two
 * steps: it takes a real place in the flow (pushing later steps down) instead
 * of floating over them. It opens and closes instantly. Picking a type turns
 * it into that step in place; closing removes it. It's never saved (see
 * `stripPlaceholderNodes`).
 */
export const PickerNode = ({ id }: NodeProps<WorkflowNode>) => {
	const { pickStep, removePlaceholder } = useNodeEditor();
	return (
		<div className="relative">
			<TargetHandle />
			<StepPicker
				onPick={(kind, from) =>
					pickStep({ type: "replace", nodeId: id }, kind, from)
				}
				onClose={removePlaceholder}
			/>
			<SourceHandle hidden />
		</div>
	);
};
