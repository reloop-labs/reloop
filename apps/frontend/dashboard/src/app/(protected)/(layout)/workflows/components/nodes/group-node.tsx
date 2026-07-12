"use client";

import { cn } from "@reloop/ui/cn";
import type { Node, NodeProps } from "@xyflow/react";

export interface GroupNodeData {
	label: string;
	[key: string]: unknown;
}

type GroupFlowNode = Node<GroupNodeData, "group">;

export const GroupNode = ({ data, selected }: NodeProps<GroupFlowNode>) => {
	return (
		<div
			className={cn(
				"relative h-full w-full rounded-2xl border border-dashed bg-bg-weak-50/30 transition-colors dark:bg-bg-white-0/[0.02]",
				selected
					? "border-orange-500/60"
					: "border-stroke-soft-200 dark:border-stroke-soft-100/50",
			)}
		>
			<span className="absolute top-2.5 left-3 rounded-md bg-bg-white-0 px-2 py-1 font-mono text-[11px] text-text-soft-400 leading-none tracking-wide shadow-regular-xs dark:bg-bg-white-0/10">
				{data.label}
			</span>
		</div>
	);
};
