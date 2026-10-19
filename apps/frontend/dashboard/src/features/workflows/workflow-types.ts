import type { Edge, Node } from "@xyflow/react";
import type { EdgeTone } from "./components/nodes/flow-edge";
import type { GroupNodeData } from "./components/nodes/group-node";

export type WorkflowStatus = "draft" | "active" | "paused";

export type WorkflowNodeType =
	| "trigger"
	| "send_email"
	| "delay"
	| "condition"
	| "group"
	/** Unsaved placeholder holding the step menu while inserting (never persisted). */
	| "add_step";

export type ConditionOperator =
	| "eq"
	| "neq"
	| "contains"
	| "starts_with"
	| "ends_with"
	| "exists"
	| "not_exists"
	| "is_empty"
	| "gt"
	| "gte"
	| "lt"
	| "lte";

/** A fixed value, or another field to compare with (set through the API). */
export type ConditionValue = string | number | boolean | null | { var: string };

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
	/** Template id selected from the template picker. */
	templateId?: string;
	/** Legacy fields (kept for older nodes; new nodes use the template). */
	to?: string;
	subject?: string;
	from?: string;
	html?: string;
	text?: string;
	[key: string]: unknown;
}

export interface DelayNodeData extends NodeCardMeta {
	/** Unset on a brand-new Delay step: the user always picks the wait. */
	amount?: number;
	unit?: DelayUnit;
	[key: string]: unknown;
}

export interface ConditionNodeData extends NodeCardMeta {
	/** `contact.email` / `contact.plan` / `trigger.plan` (legacy: `email` / `property.plan` / `event.plan`) */
	field: string;
	operator: ConditionOperator;
	value?: ConditionValue;
	/** `and` / `or` group of `rules` (only created through the API). */
	type?: "rule" | "and" | "or";
	rules?: Record<string, unknown>[];
	[key: string]: unknown;
}

export type WorkflowNodeData =
	| TriggerNodeData
	| SendEmailNodeData
	| DelayNodeData
	| ConditionNodeData
	| GroupNodeData;

export type WorkflowNode = Node<WorkflowNodeData, WorkflowNodeType>;

export interface WorkflowEdgeData extends Record<string, unknown> {
	tone?: EdgeTone;
	branch?: "yes" | "no";
}

export type WorkflowEdge = Edge<WorkflowEdgeData>;

/**
 * once: each contact goes through it once. restart: the trigger starts it
 * again, cancelling a run in progress. parallel: runs overlap.
 */
export type WorkflowReentry = "once" | "restart" | "parallel";

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
	/** What the trigger does for a contact who already went through it. */
	reentry: WorkflowReentry;
	createdAt: string;
	updatedAt: string;
}

export interface CreateWorkflowInput {
	name: string;
	description?: string;
	organizationId: string;
	reentry?: WorkflowReentry;
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

export const isConditionNode = (
	node: WorkflowNode,
): node is Node<ConditionNodeData, "condition"> => node.type === "condition";
