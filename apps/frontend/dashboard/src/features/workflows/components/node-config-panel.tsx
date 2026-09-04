"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { nodeTone, type WorkflowNodeTone } from "../node-tone";
import {
	isConditionNode,
	isDelayNode,
	isSendEmailNode,
	isTriggerNode,
	type WorkflowNode,
} from "../workflow-types";
import { getNodeIssue } from "../workflow-validation";
import { ConditionConfigForm } from "./condition-config-form";
import { DelayConfigForm } from "./delay-config-form";
import { SendEmailConfigForm } from "./send-email-config-form";
import { TriggerConfigForm } from "./trigger-config-form";

interface NodeConfigPanelProps {
	selectedNode: WorkflowNode | null;
	onUpdateNode: (nodeId: string, data: Record<string, unknown>) => void;
	onDeleteNode?: (nodeId: string) => void;
	onClose: () => void;
}

const TONE_BY_TYPE: Record<string, WorkflowNodeTone> = {
	trigger: "trigger",
	delay: "delay",
	condition: "condition",
	send_email: "send_email",
};

export const NodeConfigPanel = ({
	selectedNode,
	onUpdateNode,
	onDeleteNode,
	onClose,
}: NodeConfigPanelProps) => {
	const open = selectedNode !== null;
	const tone = selectedNode
		? (TONE_BY_TYPE[selectedNode.type] ?? "trigger")
		: "trigger";
	const meta = nodeTone[tone];
	const issue = selectedNode ? getNodeIssue(selectedNode) : null;

	const canDelete =
		selectedNode?.type === "send_email" ||
		selectedNode?.type === "delay" ||
		selectedNode?.type === "condition";

	return (
		<aside
			data-open={open ? "true" : "false"}
			aria-hidden={!open}
			className={cn(
				"workflow-config-panel absolute inset-y-0 right-0 z-20 flex w-[340px] max-w-full flex-col border-stroke-soft-100 border-l bg-bg-white-0 shadow-[-12px_0_32px_rgba(15,23,42,0.06)] dark:border-stroke-soft-100/50 dark:bg-bg-white-0 dark:shadow-[-12px_0_32px_rgba(0,0,0,0.35)]",
			)}
		>
			{selectedNode ? (
				<>
					<div className="flex items-start justify-between gap-3 border-stroke-soft-100 border-b px-4 py-3 dark:border-stroke-soft-100/50">
						<div className="flex min-w-0 items-start gap-3">
							<div
								className={cn(
									"mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
									meta.well,
								)}
							>
								<Icon name={meta.icon} className="h-4 w-4" />
							</div>
							<div className="min-w-0">
								<p className="font-semibold text-sm text-text-strong-950">
									{meta.label}
								</p>
								<p className="text-text-sub-600 text-xs">
									{issue ?? "Configure this step"}
								</p>
							</div>
						</div>
						<Button.Root
							variant="neutral"
							mode="ghost"
							size="xsmall"
							onClick={onClose}
							aria-label="Close panel"
						>
							<Icon name="close" className="h-4 w-4" />
						</Button.Root>
					</div>

					<div className="flex-1 overflow-y-auto p-4">
						{isTriggerNode(selectedNode) && (
							<TriggerConfigForm
								value={
									(typeof selectedNode.data.eventKey === "string" &&
										selectedNode.data.eventKey) ||
									(typeof selectedNode.data.eventId === "string"
										? selectedNode.data.eventId
										: undefined)
								}
								onChange={(eventKey, metaEvent) =>
									onUpdateNode(selectedNode.id, {
										...selectedNode.data,
										eventKey,
										eventId: metaEvent?.eventId ?? eventKey,
										eventName: metaEvent?.name,
									})
								}
							/>
						)}
						{isDelayNode(selectedNode) && (
							<DelayConfigForm
								value={selectedNode.data}
								onChange={(data) => onUpdateNode(selectedNode.id, data)}
							/>
						)}
						{isSendEmailNode(selectedNode) && (
							<SendEmailConfigForm
								value={selectedNode.data}
								onChange={(data) => onUpdateNode(selectedNode.id, data)}
							/>
						)}
						{isConditionNode(selectedNode) && (
							<ConditionConfigForm
								value={selectedNode.data}
								onChange={(data) => onUpdateNode(selectedNode.id, data)}
							/>
						)}
					</div>

					{canDelete && onDeleteNode ? (
						<div className="border-stroke-soft-100 border-t p-4 dark:border-stroke-soft-100/50">
							<Button.Root
								variant="error"
								mode="stroke"
								size="small"
								className="w-full gap-2"
								onClick={() => onDeleteNode(selectedNode.id)}
							>
								<Icon name="trash" className="h-4 w-4" />
								Delete step
							</Button.Root>
						</div>
					) : null}
				</>
			) : null}
		</aside>
	);
};
