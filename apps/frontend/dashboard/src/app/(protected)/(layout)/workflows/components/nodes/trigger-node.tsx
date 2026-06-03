"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { WEBHOOK_EVENTS_BY_ID } from "@reloop/webhook-events";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { TriggerNodeData, WorkflowNode } from "../../workflow-types";

type TriggerFlowNode = WorkflowNode & { type: "trigger"; data: TriggerNodeData };

export const TriggerNode = ({
	data,
	selected,
}: NodeProps<TriggerFlowNode>) => {
	const event = data.eventId
		? WEBHOOK_EVENTS_BY_ID.get(data.eventId)
		: undefined;
	const configured = Boolean(data.eventId);

	return (
		<div
			className={cn(
				"min-w-[200px] rounded-xl border bg-bg-white-0 px-4 py-3 shadow-regular-sm transition-shadow dark:bg-bg-white-0/5",
				selected
					? "border-purple-500 ring-2 ring-purple-500/20"
					: "border-stroke-soft-100 dark:border-stroke-soft-100/50",
			)}
		>
			<div className="mb-2 flex items-center gap-2">
				<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/15">
					<Icon name="zap" className="h-3.5 w-3.5 text-purple-600" />
				</div>
				<span className="font-semibold text-text-strong-950 text-xs uppercase tracking-wide">
					Trigger
				</span>
			</div>
			<p className="font-medium text-sm text-text-strong-950">
				{event?.name ?? "Select event"}
			</p>
			<p className="mt-0.5 text-text-sub-600 text-xs">
				{configured ? event?.description : "Configure in the panel →"}
			</p>
			<Handle
				type="source"
				position={Position.Right}
				className="!h-2.5 !w-2.5 !border-2 !border-bg-white-0 !bg-purple-500"
			/>
		</div>
	);
};
