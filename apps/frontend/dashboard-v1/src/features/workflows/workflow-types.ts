import type { WebhookEventName } from "@reloop/webhook-events";
import type { Edge, Node } from "@xyflow/react";
import type { EdgeTone } from "./components/nodes/flow-edge";
import type { GroupNodeData } from "./components/nodes/group-node";

export type WorkflowStatus = "draft" | "active" | "paused";

export type WorkflowNodeType = "trigger" | "send_email" | "group";

/** Presentational fields shared by every node card (see FlowNodeCard). */
interface NodeCardMeta {
	/** Monospace category label rendered in the card header. */
	category?: string;
	/** Renders the "OPTIONAL" pill in the card header. */
	optional?: boolean;
}

export interface TriggerNodeData extends NodeCardMeta {
	eventId?: WebhookEventName | string;
	[key: string]: unknown;
}

export interface SendEmailNodeData extends NodeCardMeta {
	to: string;
	subject: string;
	from?: string;
	templateId?: string;
	[key: string]: unknown;
}

export type WorkflowNodeData =
	| TriggerNodeData
	| SendEmailNodeData
	| GroupNodeData;

export type WorkflowNode = Node<WorkflowNodeData, WorkflowNodeType>;

export interface WorkflowEdgeData extends Record<string, unknown> {
	tone?: EdgeTone;
}

export type WorkflowEdge = Edge<WorkflowEdgeData>;

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
