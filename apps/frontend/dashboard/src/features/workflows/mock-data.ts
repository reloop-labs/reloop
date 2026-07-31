import type {
	CreateWorkflowInput,
	Workflow,
	WorkflowNode,
} from "./workflow-types";
import { TRIGGER_NODE_ID } from "./workflow-types";

const now = () => new Date().toISOString();

/** Horizontal center used so cards (300px wide) line up in a vertical column. */
const COLUMN_X = 220;
const ROW_GAP = 200;

export const createTriggerNode = (): WorkflowNode => ({
	id: TRIGGER_NODE_ID,
	type: "trigger",
	position: { x: COLUMN_X, y: 60 },
	data: {},
});

export const createSendEmailNode = (
	index: number,
	yOffset = 0,
): WorkflowNode => ({
	id: `send_email_${Date.now()}_${index}`,
	type: "send_email",
	position: { x: COLUMN_X, y: 60 + ROW_GAP + yOffset * ROW_GAP },
	data: {
		to: "{{contact.email}}",
		subject: "",
		from: "",
	},
});

export const createDelayNode = (index: number, yOffset = 0): WorkflowNode => ({
	id: `delay_${Date.now()}_${index}`,
	type: "delay",
	position: { x: COLUMN_X, y: 60 + ROW_GAP + yOffset * ROW_GAP },
	data: {
		amount: 5,
		unit: "minutes",
	},
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
