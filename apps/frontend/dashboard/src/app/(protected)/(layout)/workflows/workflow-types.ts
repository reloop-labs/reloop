import type { WebhookEventName } from "@reloop/webhook-events";
import type { Edge, Node } from "@xyflow/react";

export type WorkflowStatus = "draft" | "active" | "paused";

export type WorkflowNodeType = "trigger" | "send_email";

export interface TriggerNodeData {
	eventId?: WebhookEventName | string;
	[key: string]: unknown;
}

export interface SendEmailNodeData {
	to: string;
	subject: string;
	from?: string;
	templateId?: string;
	[key: string]: unknown;
}

export type WorkflowNodeData = TriggerNodeData | SendEmailNodeData;

export type WorkflowNode = Node<WorkflowNodeData, WorkflowNodeType>;
export type WorkflowEdge = Edge;

export interface Workflow {
	id: string;
	organizationId: string;
	name: string;
	description?: string;
	status: WorkflowStatus;
	nodes: WorkflowNode[];
	edges: WorkflowEdge[];
	createdAt: string;
	updatedAt: string;
}

export interface CreateWorkflowInput {
	name: string;
	description?: string;
	organizationId: string;
}

export const TRIGGER_NODE_ID = "trigger";

export const isTriggerNode = (
	node: WorkflowNode,
): node is Node<TriggerNodeData, "trigger"> => node.type === "trigger";

export const isSendEmailNode = (
	node: WorkflowNode,
): node is Node<SendEmailNodeData, "send_email"> => node.type === "send_email";
