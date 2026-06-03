"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import {
	isSendEmailNode,
	isTriggerNode,
	type WorkflowNode,
} from "../workflow-types";
import { SendEmailConfigForm } from "./send-email-config-form";
import { TriggerConfigForm } from "./trigger-config-form";

interface NodeConfigPanelProps {
	selectedNode: WorkflowNode | null;
	onUpdateNode: (nodeId: string, data: Record<string, unknown>) => void;
	onDeleteNode?: (nodeId: string) => void;
	onClose: () => void;
}

export const NodeConfigPanel = ({
	selectedNode,
	onUpdateNode,
	onDeleteNode,
	onClose,
}: NodeConfigPanelProps) => {
	if (!selectedNode) {
		return (
			<div className="flex h-full flex-col items-center justify-center border-stroke-soft-100 border-l bg-bg-weak-50/30 px-6 text-center dark:border-stroke-soft-100/50">
				<Icon name="cursor-click" className="mb-3 h-8 w-8 text-text-sub-600" />
				<p className="font-medium text-sm text-text-strong-950">
					Select a node
				</p>
				<p className="mt-1 text-text-sub-600 text-xs">
					Click a trigger or Send email step to configure it.
				</p>
			</div>
		);
	}

	const canDelete = selectedNode.type === "send_email";

	return (
		<div className="flex h-full flex-col border-stroke-soft-100 border-l bg-bg-white-0 dark:border-stroke-soft-100/50">
			<div className="flex items-center justify-between border-stroke-soft-100 border-b px-4 py-3 dark:border-stroke-soft-100/50">
				<div>
					<p className="font-semibold text-sm text-text-strong-950">
						{selectedNode.type === "trigger" ? "Trigger" : "Send email"}
					</p>
					<p className="text-text-sub-600 text-xs">Node configuration</p>
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
						value={selectedNode.data.eventId}
						onChange={(eventId) =>
							onUpdateNode(selectedNode.id, {
								...selectedNode.data,
								eventId,
							})
						}
					/>
				)}
				{isSendEmailNode(selectedNode) && (
					<SendEmailConfigForm
						value={selectedNode.data}
						onChange={(data) => onUpdateNode(selectedNode.id, data)}
					/>
				)}
			</div>

			{canDelete && onDeleteNode && (
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
			)}
		</div>
	);
};
