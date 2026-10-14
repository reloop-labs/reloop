import type {
	CreateWorkflowInput,
	Workflow,
	WorkflowNode,
} from "./workflow-types";
import { TRIGGER_NODE_ID } from "./workflow-types";

const now = () => new Date().toISOString();

/** Placeholder position; the editor lays nodes out from the graph. */
const ORIGIN = { x: 0, y: 0 };

export const createTriggerNode = (): WorkflowNode => ({
	id: TRIGGER_NODE_ID,
	type: "trigger",
	position: { ...ORIGIN },
	data: {},
});

export const createSendEmailNode = (index: number): WorkflowNode => ({
	id: `send_email_${Date.now()}_${index}`,
	type: "send_email",
	position: { ...ORIGIN },
	data: {
		templateId: "",
	},
});

export const createDelayNode = (index: number): WorkflowNode => ({
	id: `delay_${Date.now()}_${index}`,
	type: "delay",
	position: { ...ORIGIN },
	// No default wait: the input starts empty and nothing is pre-selected.
	data: {},
});

export const createConditionNode = (index: number): WorkflowNode => ({
	id: `condition_${Date.now()}_${index}`,
	type: "condition",
	position: { ...ORIGIN },
	// No default rule: field, operator and value all start empty.
	data: {},
});

/** Local-only helper for optimistic UI before API round-trip. */
export const createEmptyWorkflow = (input: CreateWorkflowInput): Workflow => {
	const timestamp = now();
	return {
		id: `wf_${Date.now()}`,
		organizationId: input.organizationId,
		name: input.name,
		description: input.description,
		status: "draft",
		nodes: [createTriggerNode()],
		edges: [],
		createdAt: timestamp,
		updatedAt: timestamp,
	};
};
