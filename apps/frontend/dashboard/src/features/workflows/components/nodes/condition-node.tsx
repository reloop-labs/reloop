"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Handle, type NodeProps, Position } from "@xyflow/react";
import type { ConditionNodeData, WorkflowNode } from "../../workflow-types";

type ConditionFlowNode = WorkflowNode & {
	type: "condition";
	data: ConditionNodeData;
};

const OPERATOR_LABEL: Record<string, string> = {
	eq: "=",
	neq: "≠",
	contains: "contains",
	exists: "is set",
	not_exists: "is not set",
	gt: ">",
	lt: "<",
};

function formatCondition(data: ConditionNodeData): string {
	const field = data.field?.trim();
	if (!field) return "Set condition";
	const op = OPERATOR_LABEL[data.operator] ?? data.operator;
	if (data.operator === "exists" || data.operator === "not_exists") {
		return `${field} ${op}`;
	}
	const value = data.value?.trim();
	if (!value) return `${field} ${op} …`;
	return `${field} ${op} ${value}`;
}

export const ConditionNode = ({
	data,
	selected,
}: NodeProps<ConditionFlowNode>) => {
	return (
		<div
			className={cn(
				"relative w-[300px] overflow-visible rounded-xl border bg-bg-white-0 shadow-regular-sm transition-[box-shadow,border-color] dark:bg-bg-white-0/5",
				selected
					? "border-orange-500 ring-2 ring-orange-500/20"
					: "border-stroke-soft-200 dark:border-stroke-soft-100/60",
			)}
		>
			<Handle type="target" position={Position.Top} />

			<div className="flex items-center justify-between gap-3 border-stroke-soft-100 border-b px-4 py-2.5">
				<span className="truncate font-mono text-[11px] text-text-soft-400 leading-none tracking-wide">
					{data.category ?? "Logic · Condition"}
				</span>
			</div>

			<div className="flex items-center gap-2.5 px-4 py-3.5 pb-6">
				<Icon
					name="filter"
					className="h-[18px] w-[18px] shrink-0 text-text-sub-600"
				/>
				<span className="min-w-0 flex-1 truncate font-semibold text-[15px] text-text-strong-950 leading-tight">
					{formatCondition(data)}
				</span>
			</div>

			<Handle
				type="source"
				position={Position.Bottom}
				id="yes"
				style={{ left: "28%" }}
			/>
			<Handle
				type="source"
				position={Position.Bottom}
				id="no"
				style={{ left: "72%" }}
			/>
			<span className="pointer-events-none absolute bottom-1 left-[28%] -translate-x-1/2 font-mono text-[10px] text-success-base">
				Yes
			</span>
			<span className="pointer-events-none absolute bottom-1 left-[72%] -translate-x-1/2 font-mono text-[10px] text-text-sub-600">
				No
			</span>
		</div>
	);
};
