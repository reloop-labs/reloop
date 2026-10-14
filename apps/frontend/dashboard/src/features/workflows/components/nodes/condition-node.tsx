"use client";

import type { NodeProps } from "@xyflow/react";
import type {
	ConditionNodeData,
	ConditionOperator,
	WorkflowNode,
} from "../../workflow-types";
import { getNodeIssue, VALUELESS_OPERATORS } from "../../workflow-validation";
import { ConditionEditor } from "../editors/condition-editor";
import { pickerTargetKey, useNodeEditor } from "../node-editor-context";
import {
	DanglingStub,
	EditSwap,
	NodePill,
	SourceHandle,
	TargetHandle,
	usePrevious,
} from "./flow-node-parts";

type ConditionFlowNode = WorkflowNode & {
	type: "condition";
	data: ConditionNodeData;
};

const OPERATOR_TEXT: Record<ConditionOperator, string> = {
	eq: "=",
	neq: "≠",
	contains: "contains",
	starts_with: "starts with",
	ends_with: "ends with",
	exists: "is set",
	not_exists: "is not set",
	is_empty: "is empty",
	gt: ">",
	gte: "≥",
	lt: "<",
	lte: "≤",
};

/** A condition value as text; `{ var }` references read as `{field}`. */
export const conditionValueText = (value: ConditionNodeData["value"]) => {
	if (value === undefined || value === null) return "";
	if (typeof value === "object") return `{${canonicalField(value.var)}}`;
	return String(value).trim();
};

export const CONTACT_FIELDS = ["email", "firstName", "lastName", "status"];

/** Older conditions stored `email`, `property.x` and `event.x`; show them as `contact.*` / `trigger.*`. */
export const canonicalField = (field: string) => {
	if (CONTACT_FIELDS.includes(field)) return `contact.${field}`;
	if (field.startsWith("property.")) return `contact.${field.slice(9)}`;
	if (field.startsWith("event.")) return `trigger.${field.slice(6)}`;
	return field;
};

export const describeCondition = (data: ConditionNodeData): string | null => {
	if (data.type === "and" || data.type === "or") {
		const count = data.rules?.length ?? 0;
		return `${data.type === "and" ? "all" : "any"} of ${count} rule${count === 1 ? "" : "s"}`;
	}
	const field = data.field?.trim() ? canonicalField(data.field.trim()) : "";
	if (!field || !data.operator) return null;
	const op = OPERATOR_TEXT[data.operator] ?? data.operator;
	if (VALUELESS_OPERATORS.has(data.operator)) {
		return `${field} ${op}`;
	}
	const value = conditionValueText(data.value);
	return value ? `${field} ${op} ${value}` : `${field} ${op} …`;
};

export const ConditionNode = ({
	data,
	id,
	selected,
	type,
}: NodeProps<ConditionFlowNode>) => {
	const { readOnly, activePickerKey } = useNodeEditor();
	// The "Add a step" menu sits over this step while changing its type; its
	// Yes/No stubs would poke out from under the taller menu.
	const changingType =
		activePickerKey === pickerTargetKey({ type: "replace", nodeId: id });
	const issue = getNodeIssue({ type, data });
	const editing = selected && !readOnly;
	const wasEditing = usePrevious(editing);

	return (
		<div className="relative">
			<TargetHandle />
			<EditSwap
				editing={editing}
				editor={<ConditionEditor nodeId={id} data={data} />}
				rest={
					<NodePill
						removable
						titleExiting={wasEditing}
						title="Condition"
						icon="split-route"
						label={describeCondition(data)}
						placeholder="Set a condition"
						mono
						ready={!issue}
					/>
				}
			/>
			<SourceHandle id="yes" hidden={editing} />
			<SourceHandle id="no" hidden />
			{editing || changingType ? null : (
				<>
					<DanglingStub
						nodeId={id}
						handle="yes"
						direction="left"
						caption="Yes"
					/>
					<DanglingStub
						nodeId={id}
						handle="no"
						direction="right"
						caption="No"
					/>
				</>
			)}
		</div>
	);
};
