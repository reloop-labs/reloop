"use client";

import type { NodeProps } from "@xyflow/react";
import { useTemplatesQuery } from "#/features/templates/hooks/use-templates-query";
import type { SendEmailNodeData, WorkflowNode } from "../../workflow-types";
import { getNodeIssue } from "../../workflow-validation";
import { SendEmailEditor } from "../editors/send-email-editor";
import { useNodeEditor } from "../node-editor-context";
import { useTemplateStepCards } from "../send-email-config-form";
import {
	DanglingStub,
	EditSwap,
	NodePill,
	SourceHandle,
	TargetHandle,
	usePrevious,
} from "./flow-node-parts";

type SendEmailFlowNode = WorkflowNode & {
	type: "send_email";
	data: SendEmailNodeData;
};

export const SendEmailNode = ({
	data,
	id,
	selected,
	type,
}: NodeProps<SendEmailFlowNode>) => {
	const { readOnly } = useNodeEditor();
	const issue = getNodeIssue({ type, data });
	const editing = selected && !readOnly;
	const wasEditing = usePrevious(editing);
	const templatesQuery = useTemplatesQuery();
	const template = data.templateId
		? templatesQuery.data?.templates.find((t) => t.id === data.templateId)
		: undefined;
	const restCards = useTemplateStepCards({
		templateId: data.templateId ?? "",
		templateName: template?.name ?? "Template",
		initialStatus: template?.status,
		readOnly: true,
		justClosed: wasEditing,
	});
	const label = data.templateId
		? (template?.name ?? "Template")
		: data.subject?.trim() || null;

	return (
		<div className="relative">
			<TargetHandle />
			<EditSwap
				editing={editing}
				editor={<SendEmailEditor nodeId={id} data={data} />}
				rest={
					<NodePill
						removable
						titleExiting={wasEditing}
						title="Send email"
						icon="mail-single"
						label={label}
						placeholder="Choose a template"
						ready={!issue}
						cardContent={data.templateId ? restCards.cardContent : undefined}
						belowCard={data.templateId ? restCards.belowCard : undefined}
					/>
				}
			/>
			<SourceHandle hidden={editing} />
			{editing ? null : <DanglingStub nodeId={id} />}
		</div>
	);
};
