import type { Edge, Node } from "@xyflow/react";
import type { EdgeTone } from "./components/nodes/flow-edge";
import type { GroupNodeData } from "./components/nodes/group-node";

export type WorkflowStatus = "draft" | "active" | "paused";

export type WorkflowNodeType = "trigger" | "send_email" | "delay" | "group";

export type DelayUnit = "minutes" | "hours" | "days";

/** Presentational fields shared by every node card (see FlowNodeCard). */
interface NodeCardMeta {
	/** Monospace category label rendered in the card header. */
	category?: string;
	/** Renders the "OPTIONAL" pill in the card header. */
	optional?: boolean;
}

export interface TriggerNodeData extends NodeCardMeta {
	/**
	 * Workflow custom event key (preferred).
	 * Not a platform webhook-events id.
	 */
	eventKey?: string;
	/** Custom event row id (evt_...) when known */
	eventId?: string;
	eventName?: string;
	[key: string]: unknown;
}

export interface SendEmailNodeData extends NodeCardMeta {
	to: string;
	subject: string;
	from?: string;
	templateId?: string;
	html?: string;
	text?: string;
	[key: string]: unknown;
}

export interface DelayNodeData extends NodeCardMeta {
	amount: number;
	unit: DelayUnit;
	[key: string]: unknown;
}

export type WorkflowNodeData =
	| TriggerNodeData
	| SendEmailNodeData
	| DelayNodeData
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
	description?: string | null;
	status: WorkflowStatus;
	triggerEvent?: string | null;
	nodes: WorkflowNode[];
	edges: WorkflowEdge[];
	activeVersionId?: string | null;
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

export const isDelayNode = (
	node: WorkflowNode,
): node is Node<DelayNodeData, "delay"> => node.type === "delay";
