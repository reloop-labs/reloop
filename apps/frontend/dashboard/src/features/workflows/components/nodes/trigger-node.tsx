"use client";

import { Icon } from "@reloop/ui/icon";
import type { NodeProps } from "@xyflow/react";
import type { TriggerNodeData, WorkflowNode } from "../../workflow-types";
import { getNodeIssue } from "../../workflow-validation";
import { FRAME_TOP } from "../editors/editor-shell";
import { TriggerEditor } from "../editors/trigger-editor";
import { useNodeEditor } from "../node-editor-context";
import { TriggerCodeDrawer } from "../trigger-code-drawer";
import {
	DanglingStub,
	EditSwap,
	NodePill,
	SourceHandle,
	usePrevious,
} from "./flow-node-parts";

/** Length of the arrow from the code box down into the trigger. */
const CODE_ARROW = 40;
const STROKE = "var(--color-stroke-sub-300)";

/**
 * "Your code" box above the trigger, with an arrow into it: clicking it opens
 * a drawer showing how to send this event from your app.
 */
const CodeEntry = ({ eventKey }: { eventKey?: string }) => (
	// The drawer is portalled but still bubbles through React; keep its clicks
	// and keys from selecting the node underneath.
	<div
		className="nodrag nopan absolute left-1/2 flex -translate-x-1/2 flex-col items-center"
		style={{ bottom: `calc(100% - ${FRAME_TOP}px)` }}
		onClick={(e) => e.stopPropagation()}
		onPointerDown={(e) => e.stopPropagation()}
		onKeyDown={(e) => e.stopPropagation()}
	>
		<TriggerCodeDrawer
			eventKey={eventKey}
			renderTrigger={({ open }) => (
				<button
					type="button"
					onClick={open}
					aria-label="Send this event from your code"
					title="Send this event from your code"
					// Two layers like the steps: gray frame around a white card.
					className="group/code rounded-[13px] border border-stroke-soft-200 bg-bg-weak-50 p-[3px] dark:border-stroke-soft-100/50 dark:bg-[#101014]"
				>
					<span className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors group-hover/code:border-stroke-sub-300 group-hover/code:text-text-strong-950 dark:border-stroke-soft-100/50 dark:bg-[#141419]">
						<Icon name="code" className="h-4 w-4" />
					</span>
				</button>
			)}
		/>
		{/* Same soft arrow as the connectors between steps. */}
		<svg
			aria-hidden
			width={12}
			height={CODE_ARROW}
			viewBox={`0 0 12 ${CODE_ARROW}`}
			className="overflow-visible"
		>
			<path
				d={`M 6 1 V ${CODE_ARROW - 4}`}
				stroke={STROKE}
				strokeWidth={2}
				strokeLinecap="round"
			/>
			<path
				d={`M 2 ${CODE_ARROW - 8} L 6 ${CODE_ARROW - 1.75} L 10 ${CODE_ARROW - 8} Z`}
				fill={STROKE}
				stroke={STROKE}
				strokeWidth={3}
				strokeLinejoin="round"
			/>
		</svg>
	</div>
);

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
	const { readOnly } = useNodeEditor();
	const issue = getNodeIssue({ type, data });
	const eventKey =
		(typeof data.eventKey === "string" && data.eventKey) ||
		(typeof data.eventId === "string" ? data.eventId : "");
	const editing = selected && !readOnly;
	const wasEditing = usePrevious(editing);

	return (
		<div className="relative">
			<CodeEntry eventKey={eventKey || undefined} />
			<EditSwap
				editing={editing}
				editor={<TriggerEditor nodeId={id} data={data} />}
				rest={
					<NodePill
						titleExiting={wasEditing}
						title="Trigger"
						icon="zap"
						label={eventKey}
						placeholder="Choose an event"
						mono
						ready={!issue}
					/>
				}
			/>
			<SourceHandle hidden={editing} />
			{editing ? null : <DanglingStub nodeId={id} />}
		</div>
	);
};
